const app = require("express").Router();

console.success("[Dashbord] / router loaded.".brightYellow);

app.get("/dashboard", async (req, res) => {
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

    let analytics;
    let countries;
    let newcountries = [];
    try {
        analytics = await global.siteanalytics.findOne({ id: global.config.client.id });
        countries = Object.keys(analytics.country[0]).sort((a, b) => analytics.country[0][b] - analytics.country[0][a]).map((c) => {
            return {
                name: c,
                value: analytics.country[0][c]
            }
        });

        const lookup = require('country-code-lookup')
        await Promise.all(countries.map(async (c) => {
            let code = c.name;
            let country = lookup.byIso(code);
            newcountries.push({
                code: code,
                name: country.country,
                visitors: c.value
            })
        }));
        // sort newcountries by visitors (descending)
        newcountries.sort((a, b) => b.visitors - a.visitors);
    } catch (e) {
        null;
    }

    res.render("dashboard/index", {
        bot: await global.client ? global.client : null,
        server: await global.serverClient ? global.serverClient : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        botsdata: await global.botsdata.find(),
        serversdata: await global.serversdata.find(),
        siteanalytics: newcountries
    });
});

module.exports = app;
