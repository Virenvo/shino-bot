const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Displays warnings for a member with a menu to delete them.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to view warnings for')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to manage messages.', flags: 64 });
    }

    const member = interaction.options.getMember('target') || interaction.member;

    const warnings = db.prepare(
      'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC'
    ).all(interaction.guild.id, member.id);

    if (warnings.length === 0) {
      return interaction.reply({ content: `${member.user.tag} has no warnings.` });
    }

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(`Warnings for ${member.user.tag}`)
      .setDescription(
        warnings.map((w, i) =>
          `**#${i + 1}** - ${w.reason}\n- Moderator: ${w.moderator_tag}\n- Date: <t:${Math.floor(w.timestamp / 1000)}:f>\n- ID: \`${w.id}\``
        ).join('\n\n')
      )
      .setTimestamp();

    const options = warnings.slice(0, 25).map((w, i) => ({
      label: `#${i + 1} - ${w.reason.substring(0, 100)}`,
      value: w.id,
      description: `Mod: ${w.moderator_tag} • ${new Date(w.timestamp).toLocaleDateString()}`,
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`warn_delete_${interaction.user.id}_${member.id}`)
      .setPlaceholder('Select a warning to delete')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};