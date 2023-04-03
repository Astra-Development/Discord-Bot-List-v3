module.exports = {
    name: "invite",
    category: "General",
    cooldown: 2,
    usage: "invite BotID",
    description: "invite bot by id",
    run: async (client, message, args) => {
        try {
            let user = await client.users.fetch(args[0]);

            if (!user) return message.reply("Please enter a valid user id");
            if (user.bot != true) return message.reply("Please enter a botID");

            message.channel.send({
                content: `Here is the invite link with 0 permissions for ${user.id} / ${user.username}\n<https://discordapp.com/oauth2/authorize?client_id=${user.id}&scope=bot&permissions=0>`,
                allowedMentions: {
                    users: [],
                    roles: [],
                    everyone: false
                }
            });
        } catch (err) {
            console.log(err);
            message.reply("Please enter a valid user id");
        }
    }
}