const app = require("express").Router();

console.success("[Dashbord] / router loaded.".brightYellow);

app.get("/dashboard/servers", async (req, res) => {
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

    res.render("dashboard/servers", {
        bot: await global.client ? global.client : null,
        sbot: await global.serverClient ? global.serverClient : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        serversdata: await global.serversdata.find()
    });
});

module.exports = app;
