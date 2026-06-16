const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'privacy',
  description: 'Shows the privacy policy link.',
  execute(message, args) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Privacy Policy')
      .setDescription('[Read our Privacy Policy](https://shino.virenvo.xyz/privacy)')
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};