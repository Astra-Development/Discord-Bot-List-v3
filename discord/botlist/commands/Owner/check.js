module.exports = {
    name: "check",
    category: "Owner",
    cooldown: 2,
    usage: "checks database",
    description: "Evals your Text",
    run: async (client, message) => {
        try {
            if (!global.config.client.owners.includes(message.author.id)) return;
            // let guild = global.config.server.id;
            // const botData = await botsdata.find();
            // if (botData.length < 1) return message.channel.send("No bots found in database");

            // let bots = [];
            // let botsWithCoowners = [];
            // for (let i = 0; i < botData.length; i++) {
            //     let bot = botData[i];
            //     if (!client.guilds.cache.get(guild).members.cache.get(bot.botID)) {
            //         bots.push(`<@${bot.botID}> - ${bot.username}`);
            //     }
            //     if (bot.coowners.length > 0) {
            //         for (let i = 0; i < bot.coowners.length; i++) {
            //             let coowner = bot.coowners[i];
            //             if (coowner == '' || coowner == ' ') continue;
            //             botsWithCoowners.push(`<@${bot.botID}> - ${bot.username}`);
            //         }
            //     }
            // }

            let startTime = Date.now();
            let msg = await message.channel.send("Checking...");

            let bots = await botsdata.find();
            const deletedBots = [];
            const privateBots = [];
            
            await Promise.all(bots.map(async b => {
                try {
                    const data = await client.rest.get('/applications/' + b.botID + '/rpc');
                    if (data.bot_public == false) privateBots.push(b.botID);
                } catch {
                    deletedBots.push(b.botID);
                }
            }));

            const embed = {};
            embed.title = `Check Completed!`;
            embed.description = `There are ${deletedBots.length} that are deleted totally from discord and ${privateBots.length} that are private!`;
            if (deletedBots.length > 0) {
                embed.description += `\n\nDeleted Bots: ${deletedBots.join(', ')}`;
            }
            if (privateBots.length > 0) {
                embed.description += `\n\nPrivate Bots: ${privateBots.join(', ')}`;
            }

            for (const b of deletedBots) {
                let botdata = await botsdata.findOne({ botID: b });
                client.channels.cache.get(global.config.server.channels.botlogs).send(`<:db_delete:816717275431174144> <@${botdata.ownerID}>${b.coowners?.length ? `, ${botdata.coowners.map(u => `<@${u}>`).join(', ')}` : ''} the bot **${botdata.botID}** has been removed!\n**Reason:** [Auto] The bot was automatically deleted, since it was also deleted from Discord.`);
                await botsdata.findOneAndDelete({ botID: b });
            }

            embed.footer = { text: `Requested by ${message.author.tag} | ${Date.now() - startTime}ms` };
            embed.timestamp = new Date();

            return msg.edit({ content: '', embeds: [embed] });
        } catch (e) {
            console.error(e);
        }
    }
}