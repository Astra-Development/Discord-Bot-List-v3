const app = require('express').Router();

console.success('[Servers] /servers/edit.js router loaded.'.brightYellow);

app.get("/servers/edit/:id", async (req, res) => {
    if (!req.user) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You must be logged in to edit a bot."
    });

    const serverdata = await serversdata.findOne({
        serverID: req.params.id
    });

    if (!serverdata) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "The bot you are looking for does not exist."
    });

    if (serverdata.ownerID != req.user.id) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You do not have permission to edit this bot."
    });

    res.render("servers/edit", {
        bot: global.client ? global.client : null,
        sbot: global.serverClient,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        serverdata: serverdata
    });
});

app.post('/servers/edit/:id', async (req, res) => {
    try {
        const ip = req.cf_ip;
        const ratelimit = ratelimitMap.get(ip);
        if (ratelimit && ((ratelimit + 60000) > Date.now())) return error(res, 'You can edit your server 1 time per minute.');
        ratelimitMap.set(ip, Date.now());

        if (!req.user) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You must be logged in to edit a bot."
        });

        const serverdata = await botsdata.findOne({
            serverID: req.params.id
        });

        if (!serverdata) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The bot you are looking for does not exist."
        });

        let {
            inviteURL,
            tags,
            shortDesc,
            longDesc,
        } = req.body;

        console.log(req.body);

        longDesc = longDesc.trim();
        shortDesc = shortDesc.trim();

        let guildCache = global.serverClient.guilds.cache.get(req.params.id);

        if (!longDesc || typeof (longDesc) !== "string") return error(res, '<strong>[Long Description]</strong> is required.');
        if (!shortDesc || typeof (shortDesc) !== "string") return error(res, '<strong>[Short Description]</strong> is required.');

        if (shortDesc.length < 50 || shortDesc.length > 200) return error(res, '<strong>[Short Description]</strong> must be between 50 and 200 characters.');
        if (longDesc.length < 500 || longDesc.length > 5000) return error(res, '<strong>[Long Description]</strong> must be between <strong>500</strong> and <strong>5000</strong> characters.');

        if (!inviteURL) return error(res, '<strong>[Invite URL]</strong> is required.');
        if (inviteURL) {
            try {
                let invite = await global.client.fetchInvite(inviteURL);
                if (!invite.guild) return error(res, '<strong>[Invite]</strong> is not a valid server invite.');
            } catch (e) {
                return error(res, '<strong>[Invite]</strong> is not a valid server invite.');
            }
        }

        await serversdata.findOneAndUpdate({
            serverID: req.params.id
        }, {
            $set: {
                inviteURL: inviteURL,
                tags: tags,
                shortDesc: shortDesc,
                longDesc: longDesc,
            }
        }, {
            upsert: true
        });

        res.json({
            error: false,
            message: `You have successfully edited your server. <a href='/server/${req.params.id}' class="btn btn-success">View Server</a>`
        });

        global.client.channels.cache.get(global.config.server.channels.botlogs).send({
            content: `<@${req.user.id}> edited ${guildCache?.name || req.params.id}\n<${global.config.website.url}/server/${req.params.id}>`,
            allowedMentions: { users: [req.user.id], roles: [] }
        });
    } catch (e) {
        concole.log(e.stack)
        error(res, 'it seems like an error has occured, please try again later. (The administrators have been notified).');
    }
});

module.exports = app;