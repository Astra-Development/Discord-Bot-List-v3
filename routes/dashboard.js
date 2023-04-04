const app = require("express").Router();

console.success("[Dashbord] / router loaded.".bgYellow.black);

app.get("/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.render("404", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You need to be logged in to view this page."
    });

    if (!global.config.client.owners.includes(req.user.id) && !global.members.cache.get(req.user.id)?.roles.cache.has(global.config.server.roles.botReviewer)) return res.render("404", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You cannot access this page."
    });

    res.render("dashboard/index", {
        bot: global.client ? global.client : null,
        server: global.serverClient ? global.serverClient : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req
    });
});

module.exports = app;