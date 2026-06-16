const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Rolls a dice (e.g. 2d20).')
    .addStringOption(option =>
      option.setName('dice')
        .setDescription('Dice notation (e.g. 2d20)')
        .setRequired(false)),
  async execute(interaction) {
    const input = interaction.options.getString('dice') || '1d6';
    const regex = /^(\d+)d(\d+)$/i;
    const match = input.match(regex);

    if (!match) {
      return interaction.reply({ content: 'Invalid format. Use `XdY` (e.g. `2d20`).', flags: 64 });
    }

    const diceCount = parseInt(match[1]);
    const diceSides = parseInt(match[2]);

    if (diceCount < 1 || diceCount > 20 || diceSides < 2 || diceSides > 100) {
      return interaction.reply({ content: 'Dice: 1–20 dice, 2–100 sides each.', flags: 64 });
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
      .setFooter({ text: `Rolled by ${interaction.user.tag}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};