const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Browse all commands by category or get info about a specific command.')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Get details about a specific command')
        .setRequired(false)),
  async execute(interaction) {
    const commandName = interaction.options.getString('command');

    if (commandName) {
      let command = interaction.client.slashCommands.get(commandName);
      if (!command) {
        command = interaction.client.commands.get(commandName);
      }
      if (!command) {
        return interaction.reply({ content: `Command \`${commandName}\` not found.`, flags: 64 });
      }

      const isSlash = command.data !== undefined;
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`Command: ${isSlash ? '/' : process.env.PREFIX}${isSlash ? command.data.name : command.name}`)
        .addFields(
          { name: 'Description', value: (isSlash ? command.data.description : command.description) || 'No description.', inline: false },
          { name: 'Category', value: command.category || 'Other', inline: true },
          { name: 'Type', value: isSlash ? 'Slash Command' : 'Prefix Command', inline: true }
        );

      return interaction.reply({ embeds: [embed] });
    }

    const { slashCommands } = interaction.client;
    const categories = new Map();

    for (const cmd of slashCommands.values()) {
      const cat = cmd.category || 'Other';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat).push(cmd);
    }

    const categoryNames = Array.from(categories.keys());

    const options = categoryNames.map(cat => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat,
      description: `${categories.get(cat).length} command(s)`,
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('Select a category')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const initialEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📚 Shino Commands')
      .setDescription('Select a category from the dropdown below to see its commands.\n\nYou can also use `/help command:<name>` for details.')
      .setFooter({ text: `${slashCommands.size} total slash commands` });

    const message = await interaction.reply({
      embeds: [initialEmbed],
      components: [row],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120000,
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'This menu is not for you.', flags: 64 });
      }

      const selected = i.values[0];
      const cmds = categories.get(selected) || [];

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📚 ${selected.charAt(0).toUpperCase() + selected.slice(1)} Commands`)
        .setDescription(
          cmds.map(c => `**/${c.data.name}** - ${c.data.description}`).join('\n') || 'No commands.'
        )
        .setFooter({ text: `${cmds.length} command(s) in this category` });

      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', () => {
      row.components[0].setDisabled(true);
      message.edit({ components: [row] }).catch(() => {});
    });
  },
};