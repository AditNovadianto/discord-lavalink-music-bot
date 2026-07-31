const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');
module.exports = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Menjeda musik'),
  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });
    const queue = queues.get(interaction.guildId);
    if (!queue?.current) return interaction.reply({ content: '❌ Tidak ada musik aktif.', ephemeral: true });
    await queue.pause();
    return interaction.reply('⏸️ Musik dijeda.');
  },
};