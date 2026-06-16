const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlocks a channel.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to unlock (default: current)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'You do not have permission to manage channels.', flags: 64 });
    }

    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const botMember = interaction.guild.members.me;

    try {
      await targetChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
      });

      await targetChannel.permissionOverwrites.delete(botMember);

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('Channel Unlocked')
        .setDescription(`${targetChannel} is now open.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModlog(interaction.guild, {
        color: 0x2ECC71,
        title: 'Channel Unlocked',
        fields: [
          { name: 'Channel', value: `${targetChannel}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while unlocking the channel.', flags: 64 });
    }
  },
};