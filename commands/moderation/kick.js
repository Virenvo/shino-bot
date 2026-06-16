const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'kick',
  description: 'Kicks a member from the server.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('You do not have permission to kick members.');
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

    if (!member.kickable) {
      return message.reply('I cannot kick this member. They may have a higher role or I lack permissions.');
    }

    if (member.id === message.author.id) {
      return message.reply('You cannot kick yourself.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const dmEmbed = new EmbedBuilder()
      .setColor(0xF04848)
      .setTitle(`You have been kicked from ${message.guild.name}`)
      .addFields(
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    try {
      await member.send({ embeds: [dmEmbed] });
    } catch {}

    try {
      await member.kick(reason);
      const embed = new EmbedBuilder()
        .setColor(0xF04848)
        .setTitle('Member Kicked')
        .addFields(
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });

      await sendModlog(message.guild, {
        color: 0xF04848,
        title: 'Member Kicked',
        fields: [
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while trying to kick that member.');
    }
  },
};