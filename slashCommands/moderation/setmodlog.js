const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setmodlog')
    .setDescription('Sets the channel for moderation logs.')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send moderation logs to')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'You do not have permission to use this command (requires Administrator).', flags: 64 });
    }

    const channel = interaction.options.getChannel('channel');

    db.prepare(`
      INSERT INTO server_settings (guild_id, key, value)
      VALUES (?, 'modlog_channel', ?)
      ON CONFLICT(guild_id, key) DO UPDATE SET value = excluded.value
    `).run(interaction.guild.id, channel.id);

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('Modlog Channel Set')
      .setDescription(`Moderation logs will now be sent to ${channel}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};