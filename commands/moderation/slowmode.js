const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'slowmode',
  description: 'Sets the slowmode for the current channel.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('You do not have permission to manage channels.');
    }

    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply('Please provide a number of seconds between 0 and 21600.');
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Slowmode Updated')
        .setDescription(seconds === 0 ? 'Slowmode has been disabled.' : `Slowmode set to ${seconds} second(s).`)
        .setTimestamp();
      message.reply({ embeds: [embed] });

      await sendModlog(message.guild, {
        color: 0x5865F2,
        title: 'Slowmode Updated',
        fields: [
          { name: 'Channel', value: `${message.channel}`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Slowmode', value: seconds === 0 ? 'Off' : `${seconds}s`, inline: true },
        ],
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while setting slowmode.');
    }
  },
};