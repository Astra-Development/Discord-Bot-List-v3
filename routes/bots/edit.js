const app = require('express').Router();
const { fetch } = require("undici");

const base64UrlAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");

console.success('[Bots] /bots/edit.js router loaded.'.brightYellow);
const botsdata = require("../../database/models/bots/bots.js");

app.get("/bots/edit/:botID", async (req, res) => {
    if (!req.user) return res.render("404.ejs", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: "You must be logged in to edit a bot."
    });

    const botdata = await botsdata.findOne({
        botID: req.params.botID
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
        message: "You do not have permission to edit this bot."
    });


    let coowners = [];
    for (let i = 0; botdata.coowners.length > i; i++) {
        try {
            let coowner = await client.users.fetch(botdata.coowners[i]);
            if (coowner) coowners.push(coowner);
        } catch (e) { }
    }

    if (coowners) {
        coowners = coowners.filter((item, index) => coowners.indexOf(item) === index);
        coowners.map(async (x) => {
            let user = await global.client.users.cache.get(x);
            if (user) {
                if (user.bot) coowners.splice(coowners.indexOf(x), 1);
                if (user.id === botdata.ownerID) coowners.splice(coowners.indexOf(x), 1);
                if (user.id === req.user.id) coowners.splice(coowners.indexOf(x), 1);
            }
        });
    }

    res.render("bots/edit", {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        botdata: botdata,
        coowners: coowners
    });
});

app.post('/bots/edit/:botID', async (req, res) => {
    try {
        const ip = req.cf_ip;
        const ratelimit = ratelimitMap.get(ip);
        if (ratelimit && ((ratelimit + 60000) > Date.now())) return error(res, 'You can edit your bot 1 time per minute.');
        ratelimitMap.set(ip, Date.now());

        if (!req.user) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You must be logged in to edit a bot."
        });

        const botdata = await botsdata.findOne({
            botID: req.params.botID
        });

        if (!botdata) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The bot you are looking for does not exist."
        });

        let {
            prefix,
            inviteURL,
            supportURL,
            websiteURL,
            webhookURL,
            githubURL,
            tags,
            shortDesc,
            longDesc,
            coowners
        } = req.body;

        longDesc = longDesc.trim();
        shortDesc = shortDesc.trim();

        if (!prefix || typeof (prefix) !== "string") return error(res, '<strong>[Prefix]</strong> is required.');
        if (!longDesc || typeof (longDesc) !== "string") return error(res, '<strong>[Long Description]</strong> is required.');
        if (!shortDesc || typeof (shortDesc) !== "string") return error(res, '<strong>[Short Description]</strong> is required.');

        if (shortDesc.length < 50 || shortDesc.length > 140) return error(res, '<strong>[Short Description]</strong> must be between 100 and 500 characters.');
        if (longDesc.length < 200 || longDesc.length > 5000) return error(res, '<strong>[Long Description]</strong> must be between <strong>500</strong> and <strong>5000</strong> characters.');

        if (!tags || typeof (tags) != 'object' || !Array.isArray(tags)) return error(res, '<strong>[Tags]</strong> is required.');
        if (!tags.every(tag => config.website.botTags.includes(tag))) return error(res, `<strong>[Tags]</strong> must be one of the following: ${config.website.botTags.map(tag => `<code>${tag}</code>`).join(', ')}`);
        if (tags.length < 3) return error(res, '<strong>[Tags]</strong> must be at least 3.');
        if (tags.length > 7) return error(res, '<strong>[Tags]</strong> you cannot exceed 7 tags.');

        if (supportURL) {
            try {
                let invite = await global.client.fetchInvite(supportURL);
                if (!invite.guild) return error(res, '<strong>[Invite]</strong> is not a valid server invite.');
            } catch (e) {
                return error(res, '<strong>[Invite]</strong> is not a valid server invite.');
            }
        }

        if (webhookURL) {
            if (typeof (webhookURL) != "string" || webhookURL.indexOf("https://discord.com/api/")) return error(res, '<strong>[Webhook URL]</strong> is not a valid webhook URL.');
            const segments = webhookURL.split("/").slice(4);
            if (segments[0] == "webhooks") segments.unshift("v10")
            else if (["v6", "v7", "v8", "v9"].includes(segments[0])) segments[0] = "v10"
            else if (segments[0] != "v10") return error(res, '<strong>[Webhook URL]</strong> is not a valid webhook URL.');
            let base64;
            try {
                if (segments[1] != "webhooks" || Number.isNaN(segments[2]) || segments[3]?.split("").find(letter => base64UrlAlphabet.indexOf(letter) == -1) || segments[4] || segments.length != 4) return error(res, '<strong>[Webhook URL]</strong> is not a valid webhook URL.');
                webhookURL = `https://discord.com/api/${segments.join('/')}`;
                const resp = await fetch(webhookURL);
                if (!resp.ok) return error(res, '<strong>[Webhook URL]</strong> is not a valid webhook URL.');
            } catch(e) {
                console.log(e)
                return error(res, '<strong>[Webhook URL]</strong> is not a valid webhook URL.');
            }
        }
        if (coowners) {
            coowners = coowners.filter((item, index) => coowners.indexOf(item) === index);
            coowners.map(async (x) => {
                try {
                    let user = await global.client.users.cache.get(x);
                    if (!user) coowners.splice(coowners.indexOf(x), 1);
                    if (user.bot == true || user.id === botdata.ownerID || user.id === req.user.id) coowners.splice(coowners.indexOf(x), 1);
                } catch (e) {
                    coowners.splice(coowners.indexOf(x), 1);
                }
            });
        }

        await botsdata.findOneAndUpdate({
            botID: req.params.botID
        }, {
            $set: {
                prefix: prefix,
                inviteURL: inviteURL,
                supportURL: supportURL,
                websiteURL: websiteURL,
                webhookURL: webhookURL,
                githubURL: githubURL,
                tags: tags,
                shortDesc: shortDesc,
                longDesc: longDesc,
                coowners: coowners
            }
        }, {
            upsert: true
        });

        res.json({
            error: false,
            message: `You have successfully edited your bot. <a href="/bot/${req.params.botID}" class="btn btn-primary">View Bot</a>`
        });

        return global.client.channels.cache.get(global.config.server.channels.botlogs).send({
            content: `<@${req.user.id}>${coowners?.length ? `, ${coowners.map(u => `<@${u}>`).join(', ')}` : ''} edited ${botdata.username}\n<${global.config.website.url}/bot/${botdata.botID}>`,
            allowedMentions: { users: [req.user.id], roles: [] }
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
