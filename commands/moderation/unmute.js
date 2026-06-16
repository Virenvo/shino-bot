const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'unmute',
  description: 'Unmutes a member.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('You do not have permission to unmute members.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply('Please mention a valid member or provide a valid ID.');
    }

    if (!member.moderatable) {
      return message.reply('I cannot unmute this member. They may have a higher role or I lack permissions.');
    }

    if (!member.communicationDisabledUntil) {
      return message.reply(`${member.user.tag} is not muted.`);
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const dmEmbed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle(`You have been unmuted in ${message.guild.name}`)
      .addFields(
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    try {
      await member.send({ embeds: [dmEmbed] });
    } catch {}

    try {
      await member.timeout(null, reason);
      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('Member Unmuted')
        .addFields(
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });

      await sendModlog(message.guild, {
        color: 0x2ECC71,
        title: 'Member Unmuted',
        fields: [
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while trying to unmute that member.');
    }
  },
};