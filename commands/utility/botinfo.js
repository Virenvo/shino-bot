const { EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');

module.exports = {
  name: 'botinfo',
  description: 'Shows information about the bot.',
  execute(message, args) {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Shino Bot Info')
      .addFields(
        { name: 'Servers', value: `${message.client.guilds.cache.size}`, inline: true },
        { name: 'Users', value: `${message.client.users.cache.size}`, inline: true },
        { name: 'Channels', value: `${message.client.channels.cache.size}`, inline: true },
        { name: 'Uptime', value: `${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: 'Library', value: `discord.js v${djsVersion}`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'OS', value: `${os.type()} ${os.release()}`, inline: true },
        { name: 'Memory', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};