const app = require('express').Router();

console.success('[Users] /users/user.js router loaded.'.brightYellow);

const profilesdata = require("../../database/models/profile.js");
const botsdata = require("../../database/models/bots/bots.js");
const serversdata = require("../../database/models/servers/server.js");

app.get('/profile', async (req, res) => {
    if (!req.isAuthenticated()) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You need to be logged in to view this page."
    });

    res.redirect(`/profile/${req.user.id}`);
});

app.get('/profile/:id', async (req, res) => {
    if (!req.params.id) return res.redirect("/profile/" + req.user.id);
    let member;
    try {
        member = await client.users.fetch(req.params.id);
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

    res.render('users/profile', {
        bot: global.client ? global.client : null,
        server: global.serverClient,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        pdata: pdata,
        member: member,
        bots: await botsdata.find({ $or: [{ ownerID: member.id }, { coowners: member.id }] }),
        servers: await serversdata.find({ ownerID: member.id })
    });
});

// Edit biography
app.post('/profile/:id/edit/bio', async (req, res) => {
    try {
        const ip = req.cf_ip;
        const ratelimit = ratelimitMap.get(ip);
        if (ratelimit && ((ratelimit + 5000) > Date.now())) return error(res, 'You have reached your rate limit! Please try again in a few seconds.');
        else ratelimitMap.set(ip, Date.now());

        let { biography } = req.body;

        if (!req.isAuthenticated()) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You need to be logged in to view this page."
        });
        let member;
        try {
            member = await client.users.fetch(req.params.id);
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
            pdata = await new profilesdata({
                userID: member.id,
                biography: biography
            }).save()
        }

        if (pdata && pdata.userID !== req.user.id) return error(res, 'You are not authorized to edit this profile.');

        if (biography.length > 100) return error(res, 'Biography must be less than 100 characters.');
        await profilesdata.findOneAndUpdate({
            userID: member.id
        }, {
            $set: {
                biography: biography
            }
        }, {
            upsert: true
        });

        return res.json({
            error: false,
            message: "Your biography has been updated."
        });
    } catch (e) {
        concole.log(e.stack)
        return error(res, 'it seems like an error has occured, please try again later. (The administrators have been notified).');
    }
});

app.get('/profile/:id/comments', async (req, res) => {
    let member;
    try {
        member = await client.users.fetch(req.params.id);
    } catch (e) {
        member = null;
    }

    if (!req.user) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You need to be logged in to view this page."
    });

    if (res.user && res.user.id !== member.id) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You are not authorized to view this page."
    });

    let pdata = await profilesdata.findOne({
        userID: member.id
    });
    

    if (member === null || member.bot) {
        return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The user you are looking for does not exist."
        });
    }

    let bots = await botsdata.find({ rates: { $elemMatch: { author: member.id } } }).sort({ "rates.date": -1 });

    res.render('users/comments', {
        bot: global.client ? global.client : null,
        server: global.serverClient,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        pdata: pdata,
        member: member,
        bots: bots
    });
});

module.exports = app;