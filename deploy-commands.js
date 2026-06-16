require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];
const foldersPath = path.join(__dirname, 'slashCommands');
if (!fs.existsSync(foldersPath)) {
  console.log('No slash commands folder found.');
  process.exit(0);
}

const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const folderPath = path.join(foldersPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(`[WARNING] The command at ${file} is missing "data" or "execute".`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands for guild.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1506453954949550252'),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();