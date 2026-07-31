const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');
module.exports = {
  data: new SlashCommandBuilder().setName('leave').setDescription('Mengeluarkan bot dari voice channel'),
  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });
    const deleted = await queues.delete(interaction.guildId);
    return interaction.reply(deleted ? '👋 Bot keluar dari voice channel.' : '❌ Bot tidak sedang aktif.');
  },
};