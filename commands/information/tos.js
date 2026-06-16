const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'tos',
  description: 'Shows the Terms of Service link.',
  execute(message, args) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Terms of Service')
      .setDescription('[Read our Terms of Service](https://shino.virenvo.xyz/tos)')
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};