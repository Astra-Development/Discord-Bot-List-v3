const app = require('express').Router();

console.success('[Developers] /developers router loaded.'.bgYellow.black);

app.get('/developers', async (req, res) => {
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

    // sort developers by name name length and then by name
    developers.sort((a, b) => {
        if (a.username.length === b.username.length) {
            return a.username.localeCompare(b.username);
        } else {
            return a.username.length - b.username.length;
        }
    });

    res.render("developers", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        botsdata: await global.botsdata.find(),
        developers: developers.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i),
    });
});

module.exports = app;