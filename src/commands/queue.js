const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { formatTime } = require('../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Menampilkan antrean musik'),

  async execute(interaction, { queues }) {
    const queue = queues.get(interaction.guildId);

    if (!queue?.current) {
      await interaction.reply({ content: '❌ Tidak ada antrean aktif.', ephemeral: true });
      return;
    }

    const waiting = queue.tracks.slice(0, 10).map(
      (track, index) =>
        `${index + 1}. **${track.info.title}** — ${formatTime(track.info.length)}`,
    );

    const embed = new EmbedBuilder()
      .setTitle('📜 Antrean Musik')
      .setDescription(
        `**Sedang diputar:**\n[${queue.current.info.title}](${queue.current.info.uri})\n\n` +
        `**Berikutnya:**\n${waiting.length ? waiting.join('\n') : '_Kosong_'}`,
      )
      .addFields(
        { name: 'Volume', value: `${queue.volume}%`, inline: true },
        { name: 'Loop', value: queue.loopMode, inline: true },
        { name: 'Menunggu', value: `${queue.tracks.length}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
