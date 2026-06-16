const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');
const { isOnCooldown } = require('../../utils/cooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes a number of messages, optionally filtered by user.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Filter to messages from this user')
        .setRequired(false)),
  async execute(interaction) {
    if (isOnCooldown(interaction.user.id, 'clear', 5)) {
      return interaction.reply({ content: '⏳ Please wait 5 seconds before using /clear again.', flags: 64 });
    }

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'You do not have permission to manage messages.', flags: 64 });
    }

    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('target');

    await interaction.deferReply({ flags: 64 });

    try {
      const fetched = await interaction.channel.messages.fetch({ limit: 100, before: interaction.id });
      let filtered = fetched;

      if (user) {
        filtered = filtered.filter(m => m.author.id === user.id);
      }

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const deletable = filtered.filter(m => m.createdTimestamp > twoWeeksAgo).first(amount);

      if (deletable.length === 0) {
        return interaction.editReply('No messages to delete (they may be older than 14 days).');
      }

      const deleted = await interaction.channel.bulkDelete(deletable, true);

      const confirmation = `Deleted ${deleted.size} message(s).`;
      await interaction.editReply(confirmation);
      setTimeout(() => interaction.deleteReply().catch(() => {}), 5000);

      await sendModlog(interaction.guild, {
        color: 0x3498DB,
        title: 'Messages Cleared',
        fields: [
          { name: 'Channel', value: `${interaction.channel}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Amount', value: `${deleted.size}`, inline: true },
          ...(user ? [{ name: 'Filtered User', value: user.tag, inline: false }] : []),
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.editReply('An error occurred while trying to delete messages.');
    }
  },
};