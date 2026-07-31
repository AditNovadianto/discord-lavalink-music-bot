const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');
module.exports = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Mengacak antrean'),
  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });
    const queue = queues.get(interaction.guildId);
    if (!queue || queue.tracks.length < 2) return interaction.reply({ content: '❌ Minimal dua lagu menunggu.', ephemeral: true });
    queue.shuffle();
    return interaction.reply('🔀 Antrean berhasil diacak.');
  },
};