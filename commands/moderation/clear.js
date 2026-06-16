const { PermissionsBitField } = require('discord.js');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'clear',
  description: 'Deletes a number of messages, optionally filtered by user.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('You do not have permission to manage messages.');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('Please provide a number between 1 and 100.');
    }

    const user = message.mentions.users.first();
    let messages;

    try {
      const fetched = await message.channel.messages.fetch({ limit: 100, before: message.id });
      let filtered = fetched;

      if (user) {
        filtered = filtered.filter(m => m.author.id === user.id);
      }

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const deletable = filtered.filter(m => m.createdTimestamp > twoWeeksAgo).first(amount);

      if (deletable.length === 0) {
        const reply = await message.reply('No messages to delete (they may be older than 14 days).');
        setTimeout(() => reply.delete().catch(() => {}), 5000);
        return;
      }

      const deleted = await message.channel.bulkDelete(deletable, true);

      const reply = await message.channel.send(`Deleted ${deleted.size} message(s).`);
      setTimeout(() => reply.delete().catch(() => {}), 5000);

      await sendModlog(message.guild, {
        color: 0x3498DB,
        title: 'Messages Cleared',
        fields: [
          { name: 'Channel', value: `${message.channel}`, inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
          { name: 'Amount', value: `${deleted.size}`, inline: true },
          ...(user ? [{ name: 'Filtered User', value: user.tag, inline: false }] : []),
        ],
      });
    } catch (error) {
      console.error(error);
      const reply = await message.reply('An error occurred while trying to delete messages.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }
  },
};