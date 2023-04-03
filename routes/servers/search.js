const app = require('express').Router();

console.success('[servers] /servers/search.js router loaded.'.brightYellow);

app.get("/servers/:tag", async (req, res) => {
    let tags = {};
    let totalservers = await serversdata.find({});
    let total_tags = config.website.serverTags;
    for (let server of totalservers.filter(b => b.tags?.length))
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
    let servers = await serversdata.find({ tags: req.params.tag });
    if (page < 1) return res.redirect("/servers/" + req.params.tag);
    if ((page > Math.ceil(servers.length / 10))) return res.redirect("/servers/" + req.params.tag);
    if (Math.ceil(servers.length / 10) == 0) page = 1;

    res.render("servers/search", {
        bot: global.client ? global.client : null,
        sbot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        page: page,
        servers: servers,
        tag: req.params.tag,
        tags: tag_count
    });
});

app.post("/servers/find/:server", async (req, res) => {
    try {
        const ip = req.cf_ip;
        const ratelimit = ratelimitMap.get(ip);
        if (ratelimit && ((ratelimit + 5000) > Date.now())) return error(res, 'You have reached your rate limit! Please try again in a few seconds.');
        ratelimitMap.set(ip, Date.now());

        let { server } = req.params;
        if (!server) return error(res, 'Please provide a serverID or a server name.');
        if (server.length < 3) return error(res, 'server name or ID must be at least <strong>3</strong> characters long.');

        let serversFound = await global.serverClient.guilds.cache.filter(s => s.name.toLowerCase().includes(server.toLowerCase()) || s.id == server).map(s => s.id);

        if (!serversFound) {
            return error(res, 'Sorry but we couldn\'t find any server with that name or ID.');
        }

        serversFound = await Promise.all(serversFound.map(async s => {
            return {
                serverID: s,
                name: global.serverClient.guilds.cache.get(s).name,
                icon: global.serverClient.guilds.cache.get(s).iconURL({ dynamic: true }),
                shortDesc: (await serversdata.findOne({ serverID: s }))?.shortDesc || 'No description provided.',
                votes: (await serversdata.findOne({ serverID: s })).votes.toLocaleString() || 0,
            }
        })).catch(() => null);

        res.json({
            error: false,
            servers: await Promise.all(serversFound)
        });
    } catch (e) {
        console.error(e);
        concole.log(e.stack)
        return res.json({
            error: true,
            message: 'it seems like an error has occured, please try again later. (The administrators have been notified).'
        });
    }
});

module.exports = app;


