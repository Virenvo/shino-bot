const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutes a member for a specified duration.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g. 10m, 1h, 30s)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'You do not have permission to mute members.', flags: 64 });
    }

    const member = interaction.options.getMember('target');
    if (!member) {
      return interaction.reply({ content: 'Could not find that member.', flags: 64 });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: 'I cannot mute this member. They may have a higher role or I lack permissions.', flags: 64 });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({ content: 'You cannot mute yourself.', flags: 64 });
    }

    const durationArg = interaction.options.getString('duration');
    const durationMs = parseDuration(durationArg);
    if (!durationMs || durationMs <= 0) {
      return interaction.reply({ content: 'Invalid duration. Use formats like 10s, 5m, 1h, 1d (max 28 days).', flags: 64 });
    }

    if (durationMs > 28 * 24 * 60 * 60 * 1000) {
      return interaction.reply({ content: 'Duration cannot exceed 28 days.', flags: 64 });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    const dmEmbed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle(`You have been muted in ${interaction.guild.name}`)
      .addFields(
        { name: 'Moderator', value: interaction.user.tag, inline: true },
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
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Duration', value: durationArg, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModlog(interaction.guild, {
        color: 0xF39C12,
        title: 'Member Muted',
        fields: [
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Duration', value: durationArg, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to mute that member.', flags: 64 });
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