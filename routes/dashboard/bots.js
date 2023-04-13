const app = require("express").Router();

console.success("[Dashbord] / router loaded.".brightYellow);

app.get("/dashboard/bots", async (req, res) => {
    if (!req.isAuthenticated()) return res.render("404", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You need to be logged in to view this page."
    });

    if (!config.client.owners.includes(req.user.id) && !global.client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.has(config.server.roles.botReviewer)) return res.render("404", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You cannot access this page."
    });

    let bots = await botsdata.find();
    let developers = [];
    await Promise.all(bots.map(async bot => {
        let user = await client.users.fetch(bot.ownerID);
        if (user) {
            if (developers.includes(user.id)) return;
            developers.push(user);
        }
        for (const coowner of bot.coowners) {
            let coUser = await client.users.fetch(coowner);
            if (coUser) {
                if (developers.includes(coUser.id)) return;
                developers.push(coUser);
            }
        }
    })).catch(() => null)

    res.render("dashboard/bots", {
        bot: await global.client ? global.client : null,
        server: await global.serverClient ? global.serverClient : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        botsdata: await global.botsdata.find(),
        serversdata: await global.serversdata.find(),
        developers: developers.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
    });
});

app.post("/dashboard/bot/approve", async (req, res) => {
    if (!req.user) return error(res, "You need to be logged in to view this page.");
    if (!config.client.owners.includes(req.user.id) &&
        !global.client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.has(config.server.roles.botReviewer))
        return error(res, "You do not have permission to approve bots.");

    if (!global.client.guilds.cache.get(config.server.id).members.cache.get(req.body.botID)) return error(res, "The bot you are trying to approve is not in the main server. Invite the bot by clicking the <a href='https://discord.com/oauth2/authorize?client_id=" + req.body.botID + "&scope=bot&permissions=0' target='_blank'>invite link (0 Permissions for security reasons)</a> and try again.");
    let {
        botID
    } = req.body;

    let botdata = await botsdata.findOne({
        botID: botID
    });

    if (!botdata) return error(res, "The bot you are trying to approve does not exist.");
    if (botdata.status == "Approved") return error(res, "You cannot approve a bot that is already approved.");

    res.json({
        success: true,
        message: `You have successfully approved ${botdata.username} bot.`,
    });

    global.client.channels.cache.get(config.server.channels.botlogs).send(`<:db_verified:826375752840249365> | <@${botID}> by <@${botdata.ownerID}>${botdata.coowners?.length ? `, ${botdata.coowners.map(u => `<@${u}>`).join(', ')}` : ''}'s has been approved by <@${req.user.id}>.\n<${global.config.website.url}/bot/${botID}>`);
    await botsdata.findOneAndUpdate({
        botID: botID
    }, {
        $set: {
            status: "Approved"
        },
    });
});

app.post("/dashboard/bot/decline", async (req, res) => {
    if (!req.user) return error(res, "You need to be logged in to view this page.");
    if (!config.client.owners.includes(req.user.id) &&
        !global.client.guilds.cache.get(config.server.id).members.cache.get(req.user.id).roles.cache.has(config.server.roles.botReviewer))
        return error(res, "You do not have permission to decline bots.");
    let {
        botID,
        reason
    } = req.body;

    let botdata = await botsdata.findOne({
        botID: botID
    });

    reason.trim();
    if (!reason) return error(res, "You must provide a reason for declining this bot.");
    if (reason.length < 10) return error(res, "The reason must be at least 10 characters long for specifying a reason.");

    if (!botdata) return res.redirect("/dashboard/bots");
    if (botdata.status !== "unverified") return error(res, "You cannot decline a bot that is not unverified.");

    res.json({
        success: true,
        message: `You have successfully declined ${botdata.username} bot.`,
    });

    global.client.users.fetch(botID).then(bota => {
        global.client.channels.cache.get(config.server.channels.botlogs).send(`<:db_delete:816717275431174144> <@${botdata.ownerID}>${botdata.coowners?.length ? `, ${botdata.coowners.map(u => `<@${u}>`).join(', ')}` : ''}'s bot named <@${botID}> has been declined by <@${req.user.id}>.\n**Reason:** ${reason}`);
    });

    await botsdata.findOneAndDelete({
        botID: botID
    });
});

module.exports = app;