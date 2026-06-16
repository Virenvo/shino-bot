const { EmbedBuilder } = require('discord.js');
const db = require('./database');

function getModlogChannel(guild) {
  const row = db.prepare(
    'SELECT value FROM server_settings WHERE guild_id = ? AND key = ?'
  ).get(guild.id, 'modlog_channel');
  if (!row) return null;
  return guild.channels.cache.get(row.value);
}

async function sendModlog(guild, embedData) {
  const channel = getModlogChannel(guild);
  if (!channel) return;

  const embed = new EmbedBuilder(embedData).setTimestamp();
  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send modlog:', error);
  }
}

module.exports = { sendModlog };