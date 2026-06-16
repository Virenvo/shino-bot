const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('privacy')
    .setDescription('Shows the privacy policy for Shino.'),
  execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Privacy Policy')
      .setDescription('You can read our privacy policy here:\n[Privacy Policy Link](https://shino.virenvo.xyz/privacy)')
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};