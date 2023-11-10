const roles = global.config.server.roles;

module.exports = {
    name: "unpromote",
    category: "Bot Reviewers",
    cooldown: 2,
    usage: "unpromote <bot>",
    description: "Unpromote a bot",
    run: async (client, message, args) => {
        let guild = client.guilds.cache.get(config.server.id);
        if (guild.members.cache.has(message.author.id)) {
            if (guild.members.cache.get(message.author.id).roles.cache.has(roles.botReviewer)) {
                var bot = message.mentions.users.first();

                if (bot) {
                    var botUser = bot;
                } else {
                    var botID = args[0];
                    var botUser = client.users.cache.get(botID);
                }

                if (!botUser) {
                    return message.channel.send(":x: | You have given an invalid bot id or mention.");
                }

                const botData = await botsdata.findOne({
                    botID: botUser.id
                });

                if (!botData) {
                    return message.channel.send(":x: | You have given an invalid bot id or mention.");
                }

                if (!botData.promote) {
                    return message.channel.send("This bot is not promoted.");
                }

                await botsdata.findOneAndUpdate({
                    botID: botUser.id
                }, {
                    $set: {
                        promote: false
                    },
                });

                message.channel.send("Bot has been unpromoted");
            }
        }
    },
};