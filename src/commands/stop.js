const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');
module.exports = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Menghentikan musik dan keluar'),
  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });
    const deleted = await queues.delete(interaction.guildId);
    return interaction.reply(deleted ? '⏹️ Musik dihentikan dan bot keluar.' : '❌ Tidak ada antrean aktif.');
  },
};