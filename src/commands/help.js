const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Menampilkan bantuan bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎵 Lavalink Music Bot')
      .setDescription([
        '`/play query:` — judul atau URL YouTube/SoundCloud',
        '`/pause` — menjeda',
        '`/resume` — melanjutkan',
        '`/skip` — melewati lagu',
        '`/stop` — berhenti dan keluar',
        '`/queue` — melihat antrean',
        '`/nowplaying` — lagu aktif',
        '`/shuffle` — mengacak antrean',
        '`/loop mode:` — off/track/queue',
        '`/volume level:` — volume 0–100',
        '`/remove position:` — menghapus lagu tertentu',
        '`/clear` — mengosongkan antrean berikutnya',
        '`/leave` — keluar dari voice channel',
      ].join('\n'))
      .setFooter({ text: 'Audio diproses oleh Lavalink v4' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
