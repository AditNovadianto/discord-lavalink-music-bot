const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { formatTime } = require('../utils/format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Menampilkan lagu aktif'),

  async execute(interaction, { queues }) {
    const queue = queues.get(interaction.guildId);
    const track = queue?.current;

    if (!track) {
      await interaction.reply({ content: '❌ Tidak ada lagu aktif.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('🎶 Sedang Diputar')
      .setDescription(`**[${track.info.title}](${track.info.uri})**`)
      .addFields(
        { name: 'Durasi', value: formatTime(track.info.length), inline: true },
        { name: 'Volume', value: `${queue.volume}%`, inline: true },
        { name: 'Loop', value: queue.loopMode, inline: true },
      )
      .setTimestamp();

    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);

    await interaction.reply({ embeds: [embed] });
  },
};
