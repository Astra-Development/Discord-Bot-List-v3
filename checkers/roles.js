(async () => {
    const botdata = await botsdata.find();
    const roles = global.config.server.roles;

    const developer = roles.botDeveloper;
    const verifiedBot = roles.verifiedBot;
    const unverifiedBot = roles.unverifiedBot;

    setInterval(() => {
        const guild = global.client.guilds.cache.get(global.config.server.id);
        for (const bot of botdata) {
            if (bot.status === "Approved") {
                if (!guild.members.cache.has(bot.botID)) return;
                try {
                    guild.members.cache.get(bot.botID).roles.add(verifiedBot);
                    guild.members.cache.get(bot.botID).roles.remove(unverifiedBot);
                    guild.members.cache.get(bot.ownerID).roles.add(developer);
                    for (const coowner of bot.coowners) {
                        guild.members.cache.get(coowner).roles.add(developer);
                    }
                } catch { null }
            }
        }
    }, 600000); // 10 minutes
})();