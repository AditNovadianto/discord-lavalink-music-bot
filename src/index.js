require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
} = require('discord.js');
const { Shoukaku, Connectors } = require('shoukaku');
const { QueueManager } = require('./music/QueueManager');
const { safeMessage } = require('./utils/format');

for (const key of ['DISCORD_TOKEN', 'CLIENT_ID']) {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} belum diisi.`);
    process.exit(1);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((name) => name.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.data.name, command);
}

const nodes = [
  {
    name: 'Main Lavalink',
    url: `${process.env.LAVALINK_HOST || 'localhost'}:${Number(process.env.LAVALINK_PORT || 2333)}`,
    auth: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
    secure: String(process.env.LAVALINK_SECURE).toLowerCase() === 'true',
  },
];

const shoukaku = new Shoukaku(
  new Connectors.DiscordJS(client),
  nodes,
  {
    moveOnDisconnect: false,
    resume: true,
    resumeTimeout: 30,
    reconnectTries: 5,
    reconnectInterval: 5,
    restTimeout: 15,
  },
);

const queues = new QueueManager(shoukaku);

shoukaku.on('ready', (name) => {
  console.log(`✅ Lavalink node "${name}" siap.`);
});

shoukaku.on('error', (name, error) => {
  console.error(`❌ Lavalink node "${name}" error:`, error);
});

shoukaku.on('close', (name, code, reason) => {
  console.warn(`⚠️ Lavalink node "${name}" tertutup (${code}): ${reason}`);
});

shoukaku.on('disconnect', (name, count) => {
  console.warn(`⚠️ Lavalink node "${name}" terputus. Player terdampak: ${count}`);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`✅ Login sebagai ${readyClient.user.tag}`);
  console.log(`📦 ${client.commands.size} slash command dimuat.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, {
      client,
      shoukaku,
      queues,
    });
  } catch (error) {
    console.error(`[COMMAND ERROR][/${interaction.commandName}]`, error);

    const payload = {
      content: `❌ Terjadi kesalahan: \`${safeMessage(error)}\``,
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload).catch(() => null);
    } else {
      await interaction.reply(payload).catch(() => null);
    }
  }
});

process.on('unhandledRejection', (error) => {
  console.error('[UNHANDLED REJECTION]', error);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
});

client.login(process.env.DISCORD_TOKEN);
