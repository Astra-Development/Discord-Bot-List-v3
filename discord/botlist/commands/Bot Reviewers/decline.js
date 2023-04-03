const roles = global.config.server.roles;

module.exports = {
    name: "decline",
    category: "Bot Reviewers",

    cooldown: 2,
    usage: "decline <bot> <reason?",
    description: "Decline a bot",
    run: async (client, message, args) => {
        let guild = client.guilds.cache.get(config.server.id);
        if (guild.members.cache.has(message.author.id)) {
            if (guild.members.cache.get(message.author.id).roles.cache.has(roles.botReviewer)) {
                var bot = message.mentions.users.first();
                if (bot) {
                    var bot = bot;
                } else {
                    var bot = args[0];
                    var bot = client.users.cache.get(bot);
                }
                if (!bot) {
                    return message.channel.send(
                        "You have given an invalid bot id or mention"
                    );
                }

                let botdata = await botsdata.findOne({
                    botID: bot.id
                });
                if (!botdata) {
                    return message.channel.send("Invalid bot");
                }
                if (botdata.status === "Approved") {
                    return message.channel.send("This bot is already Approved by someone");
                }

                var reason = args.join(" ").replace(args[0], "");
                if (!reason) {
                    return message.channel.send("Reason not given");
                }

                client.users.fetch(bot.id).then(bota => {
                    client.channels.cache.get(config.server.channels.botlogs).send(`<:db_delete:816717275431174144> <@${botdata.ownerID}>${botdata.coowners?.length ? `, ${botdata.coowners.map(u => `<@${u}>`).join(', ')}` : ''}'s bot named <@${bota.id}> has been declined by <@${message.author.id}>.\n**Reason:** ${reason}`);
                });
                await botsdata.findOneAndDelete({
                    botID: bot.id
                });
                message.channel.send("Bot has been declined");
            }
        }
    }
};