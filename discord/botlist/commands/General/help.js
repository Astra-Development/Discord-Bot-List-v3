module.exports = {
    name: "help",
    category: "General",
    cooldown: 4,
    usage: "help [Command]",
    description: "Returns all Commmands, or one specific command",
    isCommand: true,
    run: async (client, message, args) => {
        try {
            if (args[0]) {
                const embed = {};
                const cmd = client.commands.get(args[0].toLowerCase()) || client.commands.get(client.aliases.get(args[0].toLowerCase()));
                if (!cmd) {
                    embed.description = `No Information found for command **${args[0].toLowerCase()}**`;
                    return message.channel.send({
                        embeds: [embed]
                    });
                }
                if (cmd.name) embed.fields = [{
                    name: "Command name",
                    value: cmd.name
                }];
                if (cmd.name) {
                    embed.author = {
                        name: `${message.author.tag} (${message.author.id})`,
                        icon_url: message.author.displayAvatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png"
                    };
                    embed.title = "Command Details:";
                    embed.color = 0x00ff00; // Green
                };
                if (cmd.description) embed.fields.push({ name: "**Description**", value: `\`${cmd.description}\`` });
                if (cmd.aliases) embed.fields.push({ name: "**Aliases**", value: `\`${cmd.aliases.map((a) => `${a}`).join(", ")}\`` });
                if (cmd.cooldown) embed.fields.push({ name: "**Cooldown**", value: `\`${cmd.cooldown} Seconds\`` });
                else embed.fields.push({ name: "**Cooldown**", value: `\`${config.command_cooldown}\`` });
                if (cmd.usage) {
                    embed.fields.push({ name: "**Usage**", value: `\`${config.client.prefix}${cmd.usage}\`` });
                    embed.footer = { text: `Syntax: <> = required, [] = optional` };
                }
                return message.channel.send({
                    embeds: [embed]
                });
            } else {
                const embed = {};
                embed.color = 0x00ff00; // Green
                embed.title = "Help Menu";
                embed.author = {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png"
                };
                embed.description = `Welcome to the help menu! Here you can find all the commands that are available to you. To get more information about a command, type \`${config.client.prefix}help [command]\`.`;
                embed.fields = [];

                let commands = [];
                for (const [name, command] of client.commands.entries()) {
                    if (command.category) {
                        commands.push({
                            name: name,
                            category: command.category
                        });
                    }
                }

                for (const category of client.categories) {
                    const cmds = commands.filter((c) => c.category === category);
                    if (cmds.length === 0) continue;
                    embed.fields.push({
                        name: category,
                        value: cmds.map((c) => c.name).join(", "),
                        inline: true
                    });
                }

                let slashCommands = [];
                if (client.slashCommands.size > 0) {
                    for (const [name, command] of client.slashCommands.entries()) {
                        if (command.category) {
                            slashCommands.push({
                                name: name,
                                category: command.category
                            });
                        }
                    }
                }

                if (slashCommands.length > 0) {
                    embed.fields.push({
                        name: "Slash Commands",
                        value: slashCommands.map((c) => `/` + c.name).join(", "),
                        inline: false
                    });
                }

                return message.channel.send({
                    embeds: [embed]
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
};