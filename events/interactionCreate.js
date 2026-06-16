const { PermissionsBitField } = require('discord.js');
const db = require('../utils/database');
const { sendModlog } = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('warn_delete_')) {
        const [, , authorId, targetUserId] = interaction.customId.split('_');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          return interaction.reply({ content: 'You do not have permission to manage warnings.', ephemeral: true });
        }

        const warnId = interaction.values[0];

        db.prepare('DELETE FROM warnings WHERE id = ?').run(warnId);

        const warnings = db.prepare(
          'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY timestamp DESC'
        ).all(interaction.guild.id, targetUserId);

        if (warnings.length === 0) {
          await interaction.update({
            content: `<@${targetUserId}> has no warnings.`,
            embeds: [],
            components: [],
          });

          await sendModlog(interaction.guild, {
            color: 0xF39C12,
            title: 'All Warnings Cleared',
            fields: [
              { name: 'Target', value: `<@${targetUserId}>`, inline: true },
              { name: 'Moderator', value: interaction.user.tag, inline: true },
            ],
          });
          return;
        }

        const embed = {
          ...interaction.message.embeds[0].data,
          description: warnings.map((w, i) =>
            `**#${i + 1}** - ${w.reason}\n- Moderator: ${w.moderator_tag}\n- Date: <t:${Math.floor(w.timestamp / 1000)}:f>\n- ID: \`${w.id}\``
          ).join('\n\n'),
        };

        const options = warnings.slice(0, 25).map((w, i) => ({
          label: `#${i + 1} - ${w.reason.substring(0, 100)}`,
          value: w.id,
          description: `Mod: ${w.moderator_tag} • ${new Date(w.timestamp).toLocaleDateString()}`,
        }));

        const row = {
          type: 1,
          components: [{
            type: 3,
            custom_id: `warn_delete_${authorId}_${targetUserId}`,
            placeholder: 'Select a warning to delete',
            options,
          }],
        };

        await interaction.update({ embeds: [embed], components: [row] });

        await sendModlog(interaction.guild, {
          color: 0xF39C12,
          title: 'Warning Deleted',
          fields: [
            { name: 'Target', value: `<@${targetUserId}>`, inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Warn ID', value: warnId, inline: false },
          ],
        });
        return;
      }
    }

    // Slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const errorPayload = { content: 'There was an error while executing this command!', flags: 64 };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorPayload);
        } else {
          await interaction.reply(errorPayload);
        }
      } catch (innerError) {
        // Interaction expired or already handled, ignore
      }
    }
  },
};