const { EmbedBuilder } = require('discord.js');

const responses = [
  'Yes.', 'No.', 'Maybe.', 'Definitely.', 'Absolutely not.',
  'Ask again later.', 'Very likely.', 'Don\'t count on it.',
  'It is certain.', 'I doubt it.', 'Yes, but be careful.',
  'My sources say no.', 'Of course!', 'Not a chance.',
  'I think so.', 'I don\'t think so.', 'Probably.',
  'Better not tell you now.', 'Without a doubt.', 'Unlikely.'
];

module.exports = {
  name: '8ball',
  description: 'Ask the magic 8ball a question.',
  execute(message, args) {
    const question = args.join(' ');
    if (!question) {
      return message.reply('Please ask a question.');
    }

    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🎱 8ball')
      .addFields(
        { name: 'Question', value: question, inline: false },
        { name: 'Answer', value: response, inline: false }
      )
      .setFooter({ text: `Asked by ${message.author.tag}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  },
};