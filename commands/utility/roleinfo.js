const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'roleinfo',
  description: 'Shows information about a role.',
  async execute(message, args) {
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());
    if (!role) return message.reply('Please mention a role, provide its ID, or type its name.');

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

    message.reply({ embeds: [embed] });
  },
};