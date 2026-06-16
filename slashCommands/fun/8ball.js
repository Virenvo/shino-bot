const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const responses = [
  'Yes.', 'No.', 'Maybe.', 'Definitely.', 'Absolutely not.',
  'Ask again later.', 'Very likely.', 'Don\'t count on it.',
  'It is certain.', 'I doubt it.', 'Yes, but be careful.',
  'My sources say no.', 'Of course!', 'Not a chance.',
  'I think so.', 'I don\'t think so.', 'Probably.',
  'Better not tell you now.', 'Without a doubt.', 'Unlikely.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball a question.')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🎱 8ball')
      .addFields(
        { name: 'Question', value: question, inline: false },
        { name: 'Answer', value: response, inline: false }
      )
      .setFooter({ text: `Asked by ${interaction.user.tag}` })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};