require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Comandi prefisso
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.name && command.execute) {
      command.category = folder;
      client.commands.set(command.name, command);
      console.log(`Loaded prefix command "${command.name}" from ${folder}`);
    } else {
      console.log(`Skipping ${file}: missing "name" or "execute"`);
    }
  }
}

// Slash commands
client.slashCommands = new Collection();

const slashCommandsPath = path.join(__dirname, 'slashCommands');
if (fs.existsSync(slashCommandsPath)) {
  const slashFolders = fs.readdirSync(slashCommandsPath);
  for (const folder of slashFolders) {
    const folderPath = path.join(slashCommandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const slashFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of slashFiles) {
      const command = require(path.join(folderPath, file));
      if (command.data && command.execute) {
        command.category = folder;
        client.slashCommands.set(command.data.name, command);
        console.log(`Loaded slash command "${command.data.name}" from ${folder}`);
      } else {
        console.log(`Skipping ${file}: missing "data" or "execute"`);
      }
    }
  }
} else {
  fs.mkdirSync(slashCommandsPath, { recursive: true });
}

// Eventi
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.TOKEN);