const { EmbedBuilder } = require('discord.js');
const { formatTime } = require('../utils/format');

class GuildMusicQueue {
  constructor({ guildId, textChannel, player, shoukaku }) {
    this.guildId = guildId;
    this.textChannel = textChannel;
    this.player = player;
    this.shoukaku = shoukaku;

    this.tracks = [];
    this.current = null;
    this.volume = 75;
    this.loopMode = 'off';
    this.destroyed = false;
    this.eventsBound = false;

    this.bindEvents();
  }

  bindEvents() {
    if (this.eventsBound) return;
    this.eventsBound = true;

    this.player.on('start', async () => {
      if (!this.current) return;

      const embed = new EmbedBuilder()
        .setTitle('🎶 Sedang Diputar')
        .setDescription(`**[${this.current.info.title}](${this.current.info.uri})**`)
        .addFields(
          {
            name: 'Durasi',
            value: formatTime(this.current.info.length),
            inline: true,
          },
          {
            name: 'Diminta oleh',
            value: `<@${this.current.requestedBy}>`,
            inline: true,
          },
          {
            name: 'Sumber',
            value: this.current.info.sourceName || '-',
            inline: true,
          },
        )
        .setTimestamp();

      if (this.current.info.artworkUrl) {
        embed.setThumbnail(this.current.info.artworkUrl);
      }

      await this.textChannel.send({ embeds: [embed] }).catch(() => null);
    });

    this.player.on('end', async (data) => {
      if (this.destroyed || data.reason === 'replaced') return;

      const finished = this.current;
      this.current = null;

      if (finished && this.loopMode === 'track') {
        this.tracks.unshift(finished);
      } else if (finished && this.loopMode === 'queue') {
        this.tracks.push(finished);
      }

      await this.playNext();
    });

    this.player.on('exception', async (data) => {
      console.error(`[LAVALINK EXCEPTION][${this.guildId}]`, data);
      await this.textChannel
        .send(`❌ Lagu mengalami error dari Lavalink. Mencoba lagu berikutnya.`)
        .catch(() => null);
    });

    this.player.on('stuck', async () => {
      await this.textChannel
        .send('⚠️ Stream tersendat terlalu lama. Lagu dilewati.')
        .catch(() => null);

      await this.player.stopTrack().catch(() => null);
    });

    this.player.on('closed', (data) => {
      console.warn(`[VOICE CLOSED][${this.guildId}]`, data);
    });
  }

  enqueue(track) {
    this.tracks.push(track);
  }

  enqueueMany(tracks) {
    this.tracks.push(...tracks);
  }

  async playNext() {
    if (this.destroyed || this.current) return;

    const next = this.tracks.shift();

    if (!next) {
      await this.textChannel.send('✅ Antrean sudah selesai.').catch(() => null);
      return;
    }

    this.current = next;

    try {
      await this.player.playTrack({
        track: {
          encoded: next.encoded,
          userData: {
            requestedBy: next.requestedBy,
          },
        },
      });

      await this.player.setGlobalVolume(this.volume);
    } catch (error) {
      console.error(`[PLAY TRACK ERROR][${this.guildId}]`, error);
      this.current = null;
      await this.playNext();
    }
  }

  async skip() {
    if (!this.current) return false;
    await this.player.stopTrack();
    return true;
  }

  async pause() {
    await this.player.setPaused(true);
  }

  async resume() {
    await this.player.setPaused(false);
  }

  async setVolume(value) {
    this.volume = value;
    await this.player.setGlobalVolume(value);
  }

  shuffle() {
    for (let i = this.tracks.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
  }

  remove(position) {
    const index = position - 1;
    if (index < 0 || index >= this.tracks.length) return null;
    return this.tracks.splice(index, 1)[0];
  }

  clear() {
    this.tracks = [];
  }

  setLoop(mode) {
    this.loopMode = mode;
  }

  async destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.clear();
    this.current = null;

    await this.player.stopTrack().catch(() => null);
    await this.shoukaku.leaveVoiceChannel(this.guildId).catch(() => null);
  }
}

class QueueManager {
  constructor(shoukaku) {
    this.shoukaku = shoukaku;
    this.queues = new Map();
  }

  get(guildId) {
    return this.queues.get(guildId);
  }

  async create({ guild, voiceChannel, textChannel }) {
    const existing = this.get(guild.id);
    if (existing) {
      existing.textChannel = textChannel;
      return existing;
    }

    const player = await this.shoukaku.joinVoiceChannel({
      guildId: guild.id,
      channelId: voiceChannel.id,
      shardId: guild.shardId ?? 0,
      deaf: true,
    });

    const queue = new GuildMusicQueue({
      guildId: guild.id,
      textChannel,
      player,
      shoukaku: this.shoukaku,
    });

    this.queues.set(guild.id, queue);
    return queue;
  }

  async delete(guildId) {
    const queue = this.get(guildId);
    if (!queue) return false;

    await queue.destroy();
    this.queues.delete(guildId);
    return true;
  }
}

module.exports = { QueueManager };
