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

    if (!global.config.client.owners.includes(req.user.id)) return res.render("404", {
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

module.exports = app;