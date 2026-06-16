const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'mute',
  description: 'Mutes a member for a specified duration.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('You do not have permission to mute members.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!member) {
      return message.reply('Please mention a valid member or provide a valid ID.');
    }

    if (!member.moderatable) {
      return message.reply('I cannot mute this member. They may have a higher role or I lack permissions.');
    }

    if (member.id === message.author.id) {
      return message.reply('You cannot mute yourself.');
    }

    const durationArg = args[1];
    if (!durationArg) {
      return message.reply('Please provide a duration (e.g. 10m, 1h, 30s).');
    }

    const durationMs = parseDuration(durationArg);
    if (!durationMs || durationMs <= 0) {
      return message.reply('Invalid duration. Use formats like 10s, 5m, 1h, 1d (max 28 days).');
    }

    if (durationMs > 28 * 24 * 60 * 60 * 1000) {
      return message.reply('Duration cannot exceed 28 days.');
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';

    const dmEmbed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle(`You have been muted in ${message.guild.name}`)
      .addFields(
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Duration', value: durationArg, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    try {
      await member.send({ embeds: [dmEmbed] });
    } catch {}

    try {
      await member.timeout(durationMs, reason);
      const embed = new EmbedBuilder()
        .setColor(0xF39C12)
        .setTitle('Member Muted')
        .addFields(
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Duration', value: durationArg, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });

      await sendModlog(message.guild, {
        color: 0xF39C12,
        title: 'Member Muted',
        fields: [
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Duration', value: durationArg, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while trying to mute that member.');
    }
  },
};

function parseDuration(str) {
  const regex = /^(\d+)\s*(s|m|h|d)$/i;
  const match = str.match(regex);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 3600 * 1000;
    case 'd': return value * 86400 * 1000;
    default: return null;
  }
}