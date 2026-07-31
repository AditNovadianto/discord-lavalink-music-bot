const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Mengatur mode pengulangan')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Mode loop')
        .setRequired(true)
        .addChoices(
          { name: 'Off', value: 'off' },
          { name: 'Track', value: 'track' },
          { name: 'Queue', value: 'queue' },
        ),
    ),

  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });

    const queue = queues.get(interaction.guildId);
    if (!queue) return interaction.reply({ content: '❌ Tidak ada antrean aktif.', ephemeral: true });

    const mode = interaction.options.getString('mode', true);
    queue.setLoop(mode);
    return interaction.reply(`🔁 Mode loop diatur ke **${mode}**.`);
  },
};
