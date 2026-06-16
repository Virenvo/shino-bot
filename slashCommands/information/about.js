const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Shows information about Shino.'),
  execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('About Shino')
      .setDescription('A multi-purpose Discord bot built with discord.js')
      .addFields(
        { name: 'Version', value: '1.0.0', inline: true },
        { name: 'Library', value: `discord.js v${djsVersion}`, inline: true },
        { name: 'Website', value: '[shino.virenvo.xyz](https://shino.virenvo.xyz)', inline: true },
        { name: 'Support Server', value: '[Coming soon]', inline: true },
        { name: 'GitHub', value: '[Private]', inline: true }
      )
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};