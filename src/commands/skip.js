const { SlashCommandBuilder } = require('discord.js');
const { validateVoice } = require('../utils/voice');
module.exports = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Melewati lagu aktif'),
  async execute(interaction, { queues }) {
    const voice = validateVoice(interaction);
    if (!voice.ok) return interaction.reply({ content: voice.message, ephemeral: true });
    const queue = queues.get(interaction.guildId);
    if (!queue?.current) return interaction.reply({ content: '❌ Tidak ada lagu aktif.', ephemeral: true });
    const title = queue.current.info.title;
    await queue.skip();
    return interaction.reply(`⏭️ Melewati **${title}**.`);
  },
};