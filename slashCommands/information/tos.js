const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tos')
    .setDescription('Shows the Terms of Service for Shino.'),
  execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('Terms of Service')
      .setDescription('You can read our Terms of Service here:\n[Terms of Service Link](https://shino.virenvo.xyz/tos)')
      .setTimestamp();
    interaction.reply({ embeds: [embed] });
  },
};