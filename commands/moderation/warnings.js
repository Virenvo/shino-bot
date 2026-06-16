const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'warnings',
  description: 'Displays warnings for a member with a menu to delete them.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('You do not have permission to manage messages.');
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
      member = message.member;
    }

    const warnings = db.prepare(
      'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC'
    ).all(message.guild.id, member.id);

    if (warnings.length === 0) {
      return message.reply(`${member.user.tag} has no warnings.`);
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
      .setCustomId(`warn_delete_${message.author.id}_${member.id}`)
      .setPlaceholder('Select a warning to delete')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    message.reply({ embeds: [embed], components: [row] });
  },
};