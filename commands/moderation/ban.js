const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'ban',
  description: 'Bans a member from the server.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('You do not have permission to ban members.');
    }

    let member;
    if (message.mentions.members.first()) {
      member = message.mentions.members.first();
    } else if (args[0]) {
      try {
        member = await message.guild.members.fetch(args[0]);
      } catch {
        return message.reply('Could not find that member. Make sure the ID is correct.');
      }
    } else {
      return message.reply('Please mention a member or provide a valid ID.');
    }

    if (!member) {
      return message.reply('Could not find that member.');
    }

    if (!member.bannable) {
      return message.reply('I cannot ban this member. They may have a higher role or I lack permissions.');
    }

    if (member.id === message.author.id) {
      return message.reply('You cannot ban yourself.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const dmEmbed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle(`You have been banned from ${message.guild.name}`)
      .addFields(
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    try {
      await member.send({ embeds: [dmEmbed] });
    } catch {}

    try {
      await member.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('Member Banned')
        .addFields(
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });

      await sendModlog(message.guild, {
        color: 0xE74C3C,
        title: 'Member Banned',
        fields: [
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while trying to ban that member.');
    }
  },
};