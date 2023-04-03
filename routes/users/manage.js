const app = require('express').Router();

console.success('[Users] /users/manage.js router loaded.'.brightYellow);

const profilesdata = require("../../database/models/profile.js");
const botsdata = require("../../database/models/bots/bots.js");
const serversdata = require("../../database/models/servers/server.js");

app.get('/manage/profile', async (req, res) => {
    try {
        if (!req.isAuthenticated()) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You need to be logged in to view this page."
        });

        let member;
        try {
            member = await client.users.fetch(req.user.id);
        } catch (e) {
            member = null;
        }

        if (member === null || member.bot) {
            return res.render("404.ejs", {
                bot: global.client ? global.client : null,
                path: req.path,
                user: req.isAuthenticated() ? req.user : null,
                req: req,
                message: "The user you are looking for does not exist."
            });
        }

        let pdata = await profilesdata.findOne({
            userID: member.id
        });

        if (!pdata) {
            pdata = new profilesdata({
                userID: member.id,
                biography: "",
            });
            await pdata.save();
        }

        res.render('users/manage', {
            bot: global.client ? global.client : null,
            server: global.serverClient,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            pdata: pdata,
            member: member ? member : null,
            bots: await botsdata.find({ $or: [{ ownerID: member.id }, { coowners: member.id }] }),
            servers: await serversdata.find({ ownerID: member.id })
        });
    } catch (e) {
        concole.log(e.stack)
        return res.json({
            error: true,
            message: 'it seems like an error has occured, please try again later. (The administrators have been notified).'
        });
    }
});

module.exports = app;