const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmutes a member.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to unmute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unmute')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'You do not have permission to unmute members.', flags: 64 });
    }

    const member = interaction.options.getMember('target');
    if (!member) {
      return interaction.reply({ content: 'Could not find that member.', flags: 64 });
    }

    if (!member.moderatable) {
      return interaction.reply({ content: 'I cannot unmute this member. They may have a higher role or I lack permissions.', flags: 64 });
    }

    if (!member.communicationDisabledUntil) {
      return interaction.reply({ content: `${member.user.tag} is not muted.`, flags: 64 });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    const dmEmbed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle(`You have been unmuted in ${interaction.guild.name}`)
      .addFields(
        { name: 'Moderator', value: interaction.user.tag, inline: true },
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
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModlog(interaction.guild, {
        color: 0x2ECC71,
        title: 'Member Unmuted',
        fields: [
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to unmute that member.', flags: 64 });
    }
  },
};