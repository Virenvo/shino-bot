const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'unlock',
  description: 'Unlocks a channel. If no channel is specified, unlocks the current one.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply('You do not have permission to manage channels.');
    }

    let targetChannel = message.channel;
    if (args[0]) {
      const channelMention = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
      if (!channelMention || channelMention.type !== ChannelType.GuildText) {
        return message.reply('Please provide a valid text channel or ID.');
      }
      targetChannel = channelMention;
    }

    const botMember = message.guild.members.me;

    try {
      await targetChannel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: null,
      });

      await targetChannel.permissionOverwrites.delete(botMember);

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('Channel Unlocked')
        .setDescription(`${targetChannel} is now open.`)
        .setTimestamp();

      message.reply({ embeds: [embed] });

      await sendModlog(message.guild, {
        color: 0x2ECC71,
        title: 'Channel Unlocked',
        fields: [
          { name: 'Channel', value: `${targetChannel}`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
        ],
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while unlocking the channel.');
    }
  },
};