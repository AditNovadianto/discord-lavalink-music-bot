function validateVoice(interaction) {
  const memberChannel = interaction.member?.voice?.channel;

  if (!memberChannel) {
    return {
      ok: false,
      message: '❌ Kamu harus masuk ke voice channel terlebih dahulu.',
    };
  }

  const botChannel = interaction.guild?.members?.me?.voice?.channel;

  if (botChannel && botChannel.id !== memberChannel.id) {
    return {
      ok: false,
      message: `❌ Kamu harus berada di voice channel yang sama dengan bot: **${botChannel.name}**.`,
    };
  }

  return { ok: true, channel: memberChannel };
}

module.exports = { validateVoice };
