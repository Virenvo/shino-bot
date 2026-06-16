const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks a channel.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to lock (default: current)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: 'You do not have permission to manage channels.', flags: 64 });
    }

    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const botMember = interaction.guild.members.me;

    try {
      await targetChannel.permissionOverwrites.edit(botMember, {
        SendMessages: true,
      });

      await targetChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
      });

      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('Channel Locked')
        .setDescription(`${targetChannel} has been locked.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModlog(interaction.guild, {
        color: 0xE74C3C,
        title: 'Channel Locked',
        fields: [
          { name: 'Channel', value: `${targetChannel}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while locking the channel.', flags: 64 });
    }
  },
};