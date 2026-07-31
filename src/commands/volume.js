const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Mengatur volume')
    .addIntegerOption((option) =>
      option
        .setName('level')
        .setDescription('Volume 0–100')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true),
    ),

  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });

    const queue = queues.get(interaction.guildId);
    if (!queue) return interaction.reply({ content: '❌ Tidak ada antrean aktif.', ephemeral: true });

    const value = interaction.options.getInteger('level', true);
    await queue.setVolume(value);
    return interaction.reply(`🔊 Volume diatur ke **${value}%**.`);
  },
};
