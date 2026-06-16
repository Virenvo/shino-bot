const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flips a coin.'),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '💰';

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(`${emoji} Coin Flip`)
      .setDescription(`The coin landed on **${result}**!`)
      .setFooter({ text: `Flipped by ${interaction.user.tag}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};