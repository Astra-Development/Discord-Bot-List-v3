const { readdirSync } = require('fs');

module.exports = {
    name: "reload",
    category: "Owner",
    cooldown: 2,
    usage: "reload",
    description: "Re-loads all commands",
    run: async (client, message, args) => {
        try {
            if (!global.config.client.owners.includes(message.author.id)) return;
            let oldCommands = [];
            let newCommands = [];

            // Embed
            let embed = {};

            try {
                // ADD/DELETE COMMANDS
                client.commands.forEach(cmd => {
                    oldCommands.push(cmd.name);
                    delete require.cache[require.resolve(`../../commands/${cmd.category}/${cmd.name}.js`)];
                    client.commands.delete(cmd.name);
                });
                readdirSync("./discord/botlist/commands/").forEach((dir) => {
                    const commands = readdirSync(`./discord/botlist/commands/${dir}/`).filter((file) => file.endsWith(".js"));
                    for (let file of commands) {
                        let pull = require(`../../commands/${dir}/${file}`);
                        if (pull.name) {
                            client.commands.set(pull.name, pull);
                            newCommands.push(pull.name);
                        } else {
                            continue;
                        }
                        if (pull.aliases && Array.isArray(pull.aliases))
                            pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
                    }
                });

                let newFiles = newCommands.filter(x => !oldCommands.includes(x));
                let removedFiles = oldCommands.filter(x => !newCommands.includes(x));

                embed.title = "Realod Completed!";
                embed.fields = [];
                embed.fields.push({
                    name: "Total Reloads", value: `\`\`\`${oldCommands.length}\`\`\``
                })

                if (newFiles.length > 0) {
                    embed.fields.push({
                        name: "New Commands", value: `\`\`\`${newFiles.map(x => `- ${x}`).join("\n")}\`\`\``
                    })
                }
                if (removedFiles.length > 0) {
                    embed.fields.push({
                        name: "Removed Commands", value: `\`\`\`${removedFiles.map(x => `- ${x}`).join("\n")}\`\`\``
                    })
                }

                message.channel.send({
                    embeds: [embed]
                });
            } catch (e) {
                const embed = {};
                embed.title = "Reload Error";
                embed.description = `\`\`\`${e}\`\`\``;
                embed.color = 0xff0000;
                message.channel.send({
                    embeds: [embed]
                });
            }
        } catch (e) {
            message.channel.send(`There was an error while evaluating!\n\`\`\`js\n${e.message}\n\`\`\``);
        }
    },
};