const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roll',
  description: 'Rolls a dice (e.g. 2d20).',
  execute(message, args) {
    const input = args[0] || '1d6';
    const regex = /^(\d+)d(\d+)$/i;
    const match = input.match(regex);

    if (!match) {
      return message.reply('Invalid format. Use `XdY` (e.g. `2d20`).');
    }

    const diceCount = parseInt(match[1]);
    const diceSides = parseInt(match[2]);

    if (diceCount < 1 || diceCount > 20 || diceSides < 2 || diceSides > 100) {
      return message.reply('Dice: 1–20 dice, 2–100 sides each.');
    }

    const rolls = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * diceSides) + 1);
    }

    const total = rolls.reduce((a, b) => a + b, 0);

    const embed = new EmbedBuilder()
      .setColor(0xE67E22)
      .setTitle('🎲 Dice Roll')
      .addFields(
        { name: 'Input', value: input, inline: true },
        { name: 'Rolls', value: rolls.join(', '), inline: true },
        { name: 'Total', value: `${total}`, inline: false }
      )
      .setFooter({ text: `Rolled by ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};