module.exports = {
    name: "profile",
    category: "Information",
    cooldown: 2,
    usage: "profile <user>",
    description: "Shows profile of a user",
    run: async (client, message, args) => {
        try {
            const startTime = Date.now();
            let user = message.mentions.users.first() || message.guild.members.cache.find(m => m.user.username.toLowerCase() === args.join(" ").toLowerCase()) || args[0]
            if (!user) {
                user = message.author
            } else {
                user = await client.users.fetch(user)
            }

            if (user.bot == true) return message.reply({
                content: `I can't get profile information of a bot!`,
                allowedMentions: { repliedUser: false }
            })

            const bots = (await botsdata.find()).filter(a => a.ownerID == user.id)
            const servers = (await serversdata.find()).filter(a => a.ownerID == user.id)
            const embed = {};
            embed.title = `${user.username}'s Profile`;
            embed.author = {
                name: `${user.tag} (${user.id})`,
                icon_url: user.displayAvatarURL()
            };
            embed.description = `${user.username}#${user.discriminator} owns ${bots.length} bots and ${servers.length} servers!`;
            embed.fields = [];

            let botList = [];
            await Promise.all(bots.map(async (bot) => {
                const botData = await client.users.fetch(bot.botID)
                botList.push(`- [${botData.username}](${global.config.website.url}/bot/${bot.botID})`)
            })).catch(() => { null });

            let serverList = [];
            await Promise.all(servers.map(async (server) => {
                const serverData = await global.serverClient.guild.chache.get(server.serverID)
                serverList.push(`- [${serverData?.name ?? "Unknown Server"}](${global.config.website.url}/server/${server.serverID})`)
            })).catch(() => { null });

            if (botList.length > 0) {
                embed.fields.push({
                    name: "Bots", value: botList.join("\n")
                })
            }

            if (serverList.length > 0) {
                embed.fields.push({
                    name: "Servers", value: serverList.join("\n")
                })
            }

            embed.footer = {
                text: `Requested by ${message.author.username}#${message.author.discriminator} | ${Date.now() - startTime}ms`
            };
            embed.timestamp = new Date();

            return message.reply({
                embeds: [embed],
                allowedMentions: { repliedUser: false }
            })

        } catch (e) {
            console.log(e)
        }
    }
}