const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Shows the avatar of a user.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to get the avatar of')
        .setRequired(false)),
  async execute(interaction) {
    const member = interaction.options.getMember('target') || interaction.member;
    const user = member.user;

    const formats = ['webp', 'png', 'jpg', 'gif'];
    const urls = formats.map(f => `[${f}](${user.displayAvatarURL({ format: f, size: 1024 })})`).join(' • ');

    const embed = new EmbedBuilder()
      .setColor(member.displayColor || 0x2F3136)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setDescription(urls)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};