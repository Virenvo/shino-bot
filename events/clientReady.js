 const { ActivityType } = require('discord.js');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`${client.user.tag} is online!`);

    client.user.setActivity('shino.virenvo.xyz | /help', { type: ActivityType.Playing });
  },
};