const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const db = require('../../utils/database');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warns a member and stores the warning in the database.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to manage messages.', flags: 64 });
    }

    const member = interaction.options.getMember('target');
    if (!member) {
      return interaction.reply({ content: 'Could not find that member.', flags: 64 });
    }

    const reason = interaction.options.getString('reason') || 'No reason provided';

    const warnId = uuidv4();
    const timestamp = Date.now();

    db.prepare(`
      INSERT INTO warnings (id, guild_id, user_id, moderator_tag, reason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(warnId, interaction.guild.id, member.id, interaction.user.tag, reason, timestamp);

    const dmEmbed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(`You have been warned in ${interaction.guild.name}`)
      .addFields(
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    try {
      await member.send({ embeds: [dmEmbed] });
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('Member Warned')
      .addFields(
        { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setFooter({ text: `Warn ID: ${warnId}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    await sendModlog(interaction.guild, {
      color: 0xF1C40F,
      title: 'Member Warned',
      fields: [
        { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false },
      ],
      footer: { text: `Warn ID: ${warnId}` },
    });
  },
};