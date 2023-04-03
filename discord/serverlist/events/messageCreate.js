const prefix = global.config.serverClient.prefix;

module.exports = {
    name: 'messageCreate',
    run: async (serverClient, message) => {
        if (!message.guild) return;
        if (message.author.bot) return;
        if (message.partial) await message.fetch();
        if (message.channel.partial) await message.channel.fetch();

        if (message.guild.id == global.config.server.id && message.channel.id != "815347214662107178" && !global.config.client.owners.includes(message.author.id)) return;

        const prefixRegex = new RegExp(`^(<@!?${serverClient.user.id}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);
        if (!prefixRegex.test(message.content)) return;
        const [matchedPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        if (cmd.length === 0) {
            if (matchedPrefix.includes(serverClient.user.id)) {
                serverClient.commands.get('help').run(serverClient, message, args);
            }
        }

        let command = serverClient.commands.get(cmd);
        if (!command) command = serverClient.commands.get(serverClient.aliases.get(cmd));
        if (command) {
            if (!serverClient.cooldowns.has(command.name)) {
                serverClient.cooldowns.set(command.name, new Map());
            }
            const now = Date.now();
            const timestamps = serverClient.cooldowns.get(command.name);
            const cooldownAmount = (command.cooldown || config.defaultCommandCooldown) * 1000;
            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    let embed = {};
                    embed.color = 0xff0000;
                    embed.description = `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`;
                    return message.channel.send({
                        embeds: [embed]
                    })
                }
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            // check for command permissions (if any)
            if (command.permissions) {
                if (!message.guild.me.permissions.has(command.permissions)) {
                    let embed = {};
                    embed.color = 0xff0000;
                    embed.author = {
                        name: message.author.tag,
                        icon_url: serverClient.user.displayAvatarURL() || "https://cdn.discordapp.com/embed/avatars/0.png"
                    }
                    embed.description = `\`[REQUIRED PERMISSION(S)]\`\n- ${command.permissions.join("\n -")}`
                    return message.channel.send({
                        content: `${message.author}, I need the following permission(s) to execute the \`${command.name}\` command.`,
                        embeds: [embed]
                    })
                }

                if (!message.member.permissions.has(command.permissions)) {
                    let embed = {};
                    embed.color = 0xff0000;
                    embed.description = `${message.author}, you do not have the required permissions to use this command.`
                    return message.channel.send({
                        embeds: [embed]
                    }).then(msg => {
                        message.delete();
                        setTimeout(() => { msg.delete() }, 15000)
                    });
                }
            }

            command.run(serverClient, message, args);
        }
    }
}
