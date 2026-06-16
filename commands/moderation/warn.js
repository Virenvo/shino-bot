const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const db = require('../../utils/database');
const { sendModlog } = require('../../utils/logger');

module.exports = {
  name: 'warn',
  description: 'Warns a member and stores the warning in the database.',
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('You do not have permission to manage messages.');
    }

    let member;
    if (message.mentions.members.first()) {
      member = message.mentions.members.first();
    } else if (args[0]) {
      try {
        member = await message.guild.members.fetch(args[0]);
      } catch {
        return message.reply('Could not find that member. Make sure the ID is correct.');
      }
    } else {
      return message.reply('Please mention a member or provide a valid ID.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    const warnId = uuidv4();
    const timestamp = Date.now();

    db.prepare(`
      INSERT INTO warnings (id, guild_id, user_id, moderator_tag, reason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(warnId, message.guild.id, member.id, message.author.tag, reason, timestamp);

    const dmEmbed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(`You have been warned in ${message.guild.name}`)
      .addFields(
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    try {
      await member.send({ embeds: [dmEmbed] });
    } catch {}

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle('Member Warned')
      .addFields(
        { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setFooter({ text: `Warn ID: ${warnId}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });

    await sendModlog(message.guild, {
      color: 0xF1C40F,
      title: 'Member Warned',
      fields: [
        { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: true },
        { name: 'Moderator', value: message.author.tag, inline: true },
        { name: 'Reason', value: reason, inline: false },
      ],
      footer: { text: `Warn ID: ${warnId}` },
    });
  },
};