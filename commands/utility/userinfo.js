const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Displays information about a user.',
  async execute(message, args) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString());

    const embed = new EmbedBuilder()
      .setColor(member.displayColor || 0x2F3136)
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'User ID', value: member.id, inline: true },
        { name: 'Nickname', value: member.nickname || 'None', inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Server Joined', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
        { name: `Roles [${roles.length}]`, value: roles.length > 0 ? roles.join(', ') : 'None', inline: false }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};