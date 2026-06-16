const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Shows all commands or info about a specific command.',
  execute(message, args) {
    const { commands } = message.client;
    const prefix = process.env.PREFIX;

    if (!args.length) {
      const categories = {};

      commands.forEach(cmd => {
        const cat = cmd.category || 'Other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.name);
      });

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Shino Help')
        .setDescription(`Prefix: \`${prefix}\`\nUse \`${prefix}help <command>\` for details.`);

      for (const [category, cmds] of Object.entries(categories)) {
        embed.addFields({ name: category, value: cmds.map(c => `\`${c}\``).join(', '), inline: false });
      }

      return message.reply({ embeds: [embed] });
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name);

    if (!command) {
      return message.reply(`Command \`${name}\` not found.`);
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Command: ${command.name}`)
      .addFields(
        { name: 'Description', value: command.description || 'No description.', inline: false },
        { name: 'Category', value: command.category || 'Other', inline: true }
      );

    message.reply({ embeds: [embed] });
  },
};