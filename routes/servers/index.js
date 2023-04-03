const app = require('express').Router();

app.get('/servers', async (req, res) => {
    let servers = await serversdata.find();
    let tags = {};
    let total_tags = config.website.serverTags;
    for (let server of servers.filter(b => b.tags?.length))
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

    res.render('servers', {
        bot: global.client ? global.client : null,
        sbot: global.serverClient,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        servers: servers,
        tags: tag_count.sort((a, b) => b.count - a.count),
    });
});

module.exports = app;