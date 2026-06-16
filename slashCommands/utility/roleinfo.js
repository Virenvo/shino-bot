const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Shows information about a role.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to get info about')
        .setRequired(true)),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const permissions = new PermissionsBitField(role.permissions.bitfield).toArray().map(p => `\`${p}\``).join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setColor(role.color || 0x2F3136)
      .setTitle('Role Information')
      .addFields(
        { name: 'Name', value: role.name, inline: true },
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor.toUpperCase(), inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        { name: 'Managed', value: role.managed ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Permissions', value: permissions, inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};