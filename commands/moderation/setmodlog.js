const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
  name: 'setmodlog',
  description: 'Sets the channel for moderation logs.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('You do not have permission to use this command (requires Administrator).');
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return message.reply('Please provide a valid text channel or ID.');
    }

    db.prepare(`
      INSERT INTO server_settings (guild_id, key, value)
      VALUES (?, 'modlog_channel', ?)
      ON CONFLICT(guild_id, key) DO UPDATE SET value = excluded.value
    `).run(message.guild.id, channel.id);

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('Modlog Channel Set')
      .setDescription(`Moderation logs will now be sent to ${channel}.`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};