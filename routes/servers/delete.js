const app = require('express').Router();

console.success('[Servers] /servers/delete.js router loaded.'.brightYellow);

app.post("/servers/delete/:id", async (req, res) => {
    try {
        if (!req.user) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You must be logged in to delete a bot."
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

        if (serverdata.ownerID != req.user.id && !serverClient.guilds.cache.get(config.server).members.cache.get(req.user.id).permissions.has("MANAGE_GUILD")) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You do not have permission to delete this bot."
        });

        await serversdata.deleteOne({
            serverID: req.params.id
        });

        global.client.channels.cache.get(global.config.server.channels.botlogs).send({
            content: `<:db_delete:816717275431174144> <@${req.user.id}> deleted server **${req.params.id}**`
        });

        return res.json({
            error: false,
        });
    } catch (err) {
        error(res, 'it seems like an error has occured, please try again later. (The administrators have been notified).');
        concole.log(e.stack)
    }

});

module.exports = app;