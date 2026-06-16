const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user by their ID.')
    .addStringOption(option =>
      option.setName('user_id')
        .setDescription('The ID of the user to unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the unban')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'You do not have permission to unban members.', flags: 64 });
    }

    const userId = interaction.options.getString('user_id');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const banList = await interaction.guild.bans.fetch();
      const bannedUser = banList.find(ban => ban.user.id === userId);

      if (!bannedUser) {
        return interaction.reply({ content: 'That user is not banned.', flags: 64 });
      }

      await interaction.guild.members.unban(userId, reason);

      const dmEmbed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle(`You have been unbanned from ${interaction.guild.name}`)
        .addFields(
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      let dmFailed = false;
      try {
        await bannedUser.user.send({ embeds: [dmEmbed] });
      } catch {
        dmFailed = true;
      }

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('Member Unbanned')
        .addFields(
          { name: 'User', value: `${bannedUser.user.tag} (${userId})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      if (dmFailed) embed.setFooter({ text: '⚠️ Could not send DM to user.' });

      await interaction.reply({ embeds: [embed] });

      await sendModlog(interaction.guild, {
        color: 0x2ECC71,
        title: 'Member Unbanned',
        fields: [
          { name: 'User', value: `${bannedUser.user.tag} (${userId})`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'An error occurred while trying to unban that user. Make sure the ID is correct.', flags: 64 });
    }
  },
};