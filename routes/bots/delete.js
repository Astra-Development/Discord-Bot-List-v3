const app = require('express').Router();

console.success('[Bots] /bots/delete.js router loaded.'.brightYellow);

app.post("/bots/delete/:id", async (req, res) => {
    try {
        if (!req.user) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You must be logged in to delete a bot."
        });

        const botdata = await botsdata.findOne({
            botID: req.params.id
        });

        if (!botdata) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The bot you are looking for does not exist."
        });

        if (botdata.ownerID != req.user.id && !botdata.coowners.includes(req.user.id)) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You do not have permission to delete this bot."
        });

        global.client.channels.cache.get(global.config.server.channels.botlogs).send({
            content: `<:db_delete:816717275431174144> | <@${req.user.id}>${botdata.coowners?.length ? `, ${botdata.coowners.map(u => `<@${u}>`).join(', ')}` : ''} deleted bot **${botdata.botID}**`,
        });

        await botsdata.deleteOne({
            botID: req.params.id
        });

        return res.json({
            error: false,
        });
    } catch (e) {
        concole.log(e.stack)
        return error(res, 'it seems like an error has occured, please try again later. (The administrators have been notified).');
    }

});

module.exports = app;