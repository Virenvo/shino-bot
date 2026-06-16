const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Sets the slowmode for the current channel.')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Seconds (0 to disable, max 21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'You do not have permission to manage channels.', flags: 64 });
    }

    const seconds = interaction.options.getInteger('seconds');

    try {
      await interaction.channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Slowmode Updated')
        .setDescription(seconds === 0 ? 'Slowmode has been disabled.' : `Slowmode set to ${seconds} second(s).`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });

      await sendModlog(interaction.guild, {
        color: 0x5865F2,
        title: 'Slowmode Updated',
        fields: [
          { name: 'Channel', value: `${interaction.channel}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Slowmode', value: seconds === 0 ? 'Off' : `${seconds}s`, inline: true },
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while setting slowmode.', flags: 64 });
    }
  },
};