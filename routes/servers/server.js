const app = require('express').Router();

console.success('[Servers] /server/ID router loaded.'.brightYellow);

app.get('/server/:id', async (req, res) => {
    let serverdata = await serversdata.findOne({ serverID: req.params.id });
    if (!serverdata) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        sbot: global.serverClient,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "This server does not exist."
    });

    if (!global.serverClient.guilds.cache.get(req.params.id) && req.user.id != serverdata.ownerID) {
        res.render("404.ejs", {
            bot: global.client ? global.client : null,
            sbot: global.serverClient,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The server you are trying to access does not exist!"
        });
    }

    if (serverdata.inviteURL) {
        try {
            let invite = await global.serverClient.fetchInvite(serverdata.inviteURL);
            if (!invite) {
                // generate a new invite
                invite = await global.serverClient.channels.cache.get(serverdata.channels[0]).createInvite({ maxAge: 0, maxUses: 0 });
                await serversdata.updateOne({ serverID: req.params.id }, { $set: { inviteURL: invite.url } });
            }
        } catch (e) {
            // console.error(e);
        }
    } else {
        try {
            let invite = await global.serverClient.channels.cache.get(serverdata.channels[0]).createInvite({ maxAge: 0, maxUses: 0 });
            await serversdata.updateOne({ serverID: req.params.id }, { $set: { inviteURL: invite.url } });
        } catch (e) {
            // console.error(e);
        }
    }

    res.render('servers/server', {
        bot: global.client ? global.client : null,
        sbot: global.serverClient,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        serverdata: serverdata,
        moment: require('moment')
    });
});

app.get("/allservers", async (req, res) => {
    let tags = {};
    let totalServers = await serversdata.find({});
    let total_tags = config.website.botTags;
    for (let server of totalServers.filter(b => b.tags?.length))
        for (let tag of server.tags) tags[tag] = (tags[tag] || 0) + 1;
    let tag_count = [];
    for (let tag of total_tags) {
        if (tags[tag]) {
            tag_count.push({
                tag: tag,
                count: tags[tag]
            });
        } else {
            tag_count.push({
                tag: tag,
                count: 0
            });
        }
    }

    let page = req.query.page || 1;
    let servers = await serversdata.find();
    if (page < 1) return res.redirect("/servers");
    if ((page > Math.ceil(servers.length / 10))) return res.redirect("/servers");
    if (Math.ceil(servers.length / 10) == 0) page = 1;

    res.render("servers/total_servers", {
        sbot: global.serverClient ? global.serverClient : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        page: page,
        servers: servers,
        tags: tag_count
    });
});

module.exports = app;