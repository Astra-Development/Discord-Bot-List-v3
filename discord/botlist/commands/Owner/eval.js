module.exports = {
    name: "eval",
    category: "Owner",
    cooldown: 2,
    usage: "eval <cote>",
    description: "Evals your Text",
    run: async (client, message, args) => {
        try {
            if (!global.config.client.owners.includes(message.author.id)) return;
            var code = args.join(" ");
            var evaled = await eval(`(async()=>{${code}})();`);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            evaled = evaled
                .replace(RegExp(client.token, "g"), "BotToken")
                .replace(RegExp(serverClient.token, "g"), "ServerBotToken")
                .replace(RegExp(config.client.secret, "g"), "BotSecret")
                .replace(new RegExp(config.database.url.replace(/\?/g, "\\?").replace(/\+/g, "\\+"), "g"), "MongoURL")

            const embed = {};
            embed.title = "Eval";
            embed.description = "```js\n" + clean(evaled) + "```";
            embed.color = 0x00ff00;
            if (embed.description.length > 2000) {
                message.channel.send({
                    files: [{
                        attachment: Buffer.from(evaled),
                        name: "eval.txt"
                    }]
                });
            } else {
                message.channel.send({
                    embeds: [embed]
                });
            }
        } catch (err) {
            message.channel.send(`There was an error while evaluating!\n\`\`\`js\n${clean(err)}\n\`\`\``);
        }
    },
};

const clean = (text) => {
    if (typeof text === "string")
        return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
};
