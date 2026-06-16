const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'coinflip',
  description: 'Flips a coin.',
  execute(message, args) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '💰';

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(`${emoji} Coin Flip`)
      .setDescription(`The coin landed on **${result}**!`)
      .setFooter({ text: `Flipped by ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};