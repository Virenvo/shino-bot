const { Collection } = require('discord.js');
const cooldowns = new Collection();

function isOnCooldown(userId, commandName, seconds = 3) {
  const key = `${userId}-${commandName}`;
  const now = Date.now();
  if (cooldowns.has(key)) {
    const expiration = cooldowns.get(key);
    if (now < expiration) return true;
  }
  cooldowns.set(key, now + seconds * 1000);
  setTimeout(() => cooldowns.delete(key), seconds * 1000);
  return false;
}

module.exports = { isOnCooldown };