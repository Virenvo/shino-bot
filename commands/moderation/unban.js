const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'unban',
  description: 'Unbans a user by their ID.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('You do not have permission to unban members.');
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('Please provide a user ID to unban.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      const banList = await message.guild.bans.fetch();
      const bannedUser = banList.find(ban => ban.user.id === userId);

      if (!bannedUser) {
        return message.reply('That user is not banned.');
      }

      await message.guild.members.unban(userId, reason);

      const dmEmbed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle(`You have been unbanned from ${message.guild.name}`)
        .addFields(
          { name: 'Moderator', value: message.author.tag, inline: true },
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
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      if (dmFailed) embed.setFooter({ text: '⚠️ Could not send DM to user.' });

      message.reply({ embeds: [embed] });

      await sendModlog(message.guild, {
        color: 0x2ECC71,
        title: 'Member Unbanned',
        fields: [
          { name: 'User', value: `${bannedUser.user.tag} (${userId})`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
      });
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while trying to unban that user. Make sure the ID is correct.');
    }
  },
};