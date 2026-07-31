const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Menghapus lagu tertentu dari antrean')
    .addIntegerOption((option) =>
      option
        .setName('position')
        .setDescription('Nomor berdasarkan /queue')
        .setMinValue(1)
        .setRequired(true),
    ),

  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });

    const queue = queues.get(interaction.guildId);
    if (!queue) return interaction.reply({ content: '❌ Tidak ada antrean aktif.', ephemeral: true });

    const removed = queue.remove(interaction.options.getInteger('position', true));
    if (!removed) return interaction.reply({ content: '❌ Posisi tidak valid.', ephemeral: true });

    return interaction.reply(`🗑️ Menghapus **${removed.info.title}**.`);
  },
};
