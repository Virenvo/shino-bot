const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a member from the server.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'You do not have permission to kick members.', flags: 64 });
    }

    const member = interaction.options.getMember('target');
    if (!member) {
      return interaction.reply({ content: 'Could not find that member.', flags: 64 });
    }

    if (!member.kickable) {
      return interaction.reply({ content: 'I cannot kick this member. They may have a higher role or I lack permissions.', flags: 64 });
    }

    if (member.id === interaction.user.id) {
      return interaction.reply({ content: 'You cannot kick yourself.', flags: 64 });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    const dmEmbed = new EmbedBuilder()
      .setColor(0xF04848)
      .setTitle(`You have been kicked from ${interaction.guild.name}`)
      .addFields(
        { name: 'Moderator', value: interaction.user.tag, inline: true },
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
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModlog(interaction.guild, {
        color: 0xF04848,
        title: 'Member Kicked',
        fields: [
          { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to kick that member.', flags: 64 });
    }
  },
};