require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
    console.log('Cleared all global commands.');

    const guildId = '1506453954949550252';
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), { body: [] });
    console.log('Cleared all guild commands.');
  } catch (error) {
    console.error(error);
  }
})();