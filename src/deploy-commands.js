require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');

const commands = [];
const directory = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(directory).filter((name) => name.endsWith('.js'))) {
  const command = require(path.join(directory, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
    throw new Error('DISCORD_TOKEN dan CLIENT_ID wajib diisi.');
  }

  if (process.env.GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID,
      ),
      { body: commands },
    );

    console.log(`✅ ${commands.length} guild command didaftarkan.`);
    return;
  }

  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands },
  );

  console.log(`✅ ${commands.length} global command didaftarkan.`);
})().catch((error) => {
  console.error('❌ Deploy command gagal:', error);
  process.exitCode = 1;
});
