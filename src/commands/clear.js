const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');
module.exports = {
  data: new SlashCommandBuilder().setName('clear').setDescription('Menghapus seluruh lagu berikutnya'),
  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });
    const queue = queues.get(interaction.guildId);
    if (!queue || !queue.tracks.length) return interaction.reply({ content: '❌ Antrean berikutnya sudah kosong.', ephemeral: true });
    queue.clear();
    return interaction.reply('🧹 Antrean berikutnya berhasil dikosongkan.');
  },
};