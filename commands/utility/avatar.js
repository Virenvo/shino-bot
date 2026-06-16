const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Shows the avatar of a user.',
  async execute(message, args) {
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

    const formats = ['webp', 'png', 'jpg', 'gif'];
    const urls = formats.map(f => `[${f}](${member.user.displayAvatarURL({ format: f, size: 1024 })})`).join(' • ');

    const embed = new EmbedBuilder()
      .setColor(member.displayColor || 0x2F3136)
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
      .setImage(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setDescription(urls)
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};