const {
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');
const { validateVoice } = require('../utils/voice');
const { searchTracks } = require('../music/search');
const { formatTime, safeMessage } = require('../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Memutar lagu dari judul atau URL')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Judul lagu atau URL YouTube/SoundCloud')
        .setRequired(true),
    ),

  async execute(interaction, { shoukaku, queues }) {
    const voice = validateVoice(interaction);

    if (!voice.ok) {
      await interaction.reply({ content: voice.message, ephemeral: true });
      return;
    }

    const permissions = voice.channel.permissionsFor(interaction.guild.members.me);
    if (
      !permissions?.has(PermissionFlagsBits.Connect) ||
      !permissions?.has(PermissionFlagsBits.Speak)
    ) {
      await interaction.reply({
        content: '❌ Bot memerlukan permission **Connect** dan **Speak**.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      const node = shoukaku.options.nodeResolver(shoukaku.nodes);
      if (!node) {
        throw new Error('Belum ada Lavalink node yang terhubung.');
      }

      const query = interaction.options.getString('query', true);
      const result = await searchTracks(node, query, interaction.user.id);

      if (!result.tracks.length) {
        await interaction.editReply('❌ Lagu tidak ditemukan.');
        return;
      }

      const queue = await queues.create({
        guild: interaction.guild,
        voiceChannel: voice.channel,
        textChannel: interaction.channel,
      });

      const wasIdle = !queue.current;

      if (result.type === 'playlist') {
        queue.enqueueMany(result.tracks);
        await interaction.editReply(
          `✅ Playlist **${result.playlistInfo?.name || 'Tanpa nama'}** ditambahkan (${result.tracks.length} lagu).`,
        );
      } else {
        const track = result.tracks[0];
        queue.enqueue(track);
        await interaction.editReply(
          `✅ Ditambahkan: **${track.info.title}** (${formatTime(track.info.length)})`,
        );
      }

      if (wasIdle) {
        await queue.playNext();
      }
    } catch (error) {
      console.error('[PLAY ERROR]', error);
      await interaction.editReply(
        `❌ Lagu tidak dapat diputar: \`${safeMessage(error)}\``,
      );
    }
  },
};
