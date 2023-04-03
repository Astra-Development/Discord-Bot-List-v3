module.exports = {
    name: 'interactionCreate',
    run: async (client, interaction) => {
        if (!interaction.isChatInputCommand) return;
        try {
            let commandName = interaction.commandName;
            let command = global.client.slashCommands.get(commandName);
            if (!command) {
                return interaction.reply({
                    content: 'Command not found.'
                });
            } else {
                const args = (value) => {
                    try {
                        const options = interaction.options._hoistedOptions;

                        if (!options) return console.error('No options found.');
                        if (!Array.isArray(options)) return console.error('Options are not an array.');
                        let option = options.find(o => o.name === value);

                        return option ? option.value : null;
                    } catch (error) {
                        return console.error(error);
                    }
                }
                command.run(interaction, client, interaction.guild, args);
            }
        } catch (error) {
            const embed = {};
            embed.author = {
                name: interaction.member.user.tag,
                icon_url: interaction.member.user.displayAvatarURL()
            };
            embed.title = 'Command Error';
            embed.description = 'An error occured while executing this command.';
            embed.fields = [
                {
                    name: 'Command',
                    value: interaction.commandName
                },
                {
                    name: 'Error',
                    value: error.message
                }
            ];
            embed.color = 0xff0000;
            embed.timestamp = new Date();

            return interaction.reply({
                embeds: [embed]
            });
        }
    }
}