const app = require('express').Router();
const { fetch } = require("undici");

const base64UrlAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");

console.success('[Bots] /bots/new.js router loaded.'.brightYellow);

app.get('/bots/new', async (req, res) => {
    if (!req.user) return res.render('404.ejs', {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: 'You must be logged in to add a bot.'
    });

    if (!(await global.client.users.fetch(req.user.id)).avatar) {
        return res.render('404.ejs', {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: 'You must have a profile picture to add a bot.'
        });
    }

    if ((await global.client.users.fetch(req.user.id)).createdTimestamp + 2592000000 > Date.now()) return res.render('404.ejs', { // 2592000000 = 30 days
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        message: 'You must have an account for at least 30 days to add a bot.'
    });

    res.render('bots/new', {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req
    });
});

app.post('/bots/new', async (req, res) => {
    try {
        if (!req.user) return res.render('404.ejs', {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: 'You must be logged in to add a bot.'
        });

        let {
            botID,
            appID,
            coowners,
            prefix,
            inviteURL,
            githubURL,
            websiteURL,
            supportURL,
            webhookURL,
            shortDesc,
            longDesc,
            tags
        } = req.body;

        if (!botID) return error(res, 'Please provide a bot ID.');
        if (!appID) return error(res, 'Please provide an app ID.');

        const botdata = await botsdata.findOne({
            botID: botID
        });

        if (botdata) return error(res, 'This bot is already in the database.');

        let botUser;
        try {
            botUser = await global.client.users.fetch(botID);
            if (!botUser.bot) return error(res, 'The ID is not an ID of a Bot.');
        } catch (e) {
            console.log(e);
            return error(res, 'Invalid Bot ID.');
        };

        let application;
        try {
            application = await global.client.rest.get('/applications/' + appID + '/rpc');
            if (!application.bot_public) return error(res, 'The Bot is not Public.');
        } catch (e) {
            console.log(e);
            return error(res, 'Invalid Application ID.');
        };

        longDesc = longDesc.trim();
        shortDesc = shortDesc.trim();

        if (!prefix || typeof (prefix) !== "string") return error(res, '<strong>[Prefix]</strong> is required.');
        if (!shortDesc || typeof (shortDesc) !== "string") return error(res, '<strong>[Short Description]</strong> is required.');
        if (!longDesc || typeof (longDesc) !== "string") return error(res, '<strong>[Long Description]</strong> is required.');

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
                console.log(e);
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
            for (let i = 0; i < coowners.length; i++) {
                try {
                    let user = await global.client.users.fetch(coowners[i]);
                    if (!user) coowners.splice(i, 1);
                    if (user.bot) coowners.splice(i, 1);
                } catch (e) {
                    coowners.splice(i, 1);
                }
            }
        }

        await new botsdata({
            username: botUser.username,
            botID: botID,
            appID: appID,
            ownerID: req.user.id,
            avatar: botUser.displayAvatarURL({ format: 'png', size: 512 }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
            coowners: coowners,
            prefix: prefix,
            inviteURL: inviteURL,
            githubURL: githubURL,
            websiteURL: websiteURL,
            supportURL: supportURL,
            webhookURL: webhookURL,
            shortDesc: shortDesc,
            longDesc: longDesc,
            tags: tags,
            date: Date.now(),
            token: require('crypto').randomBytes(64).toString('hex'), // Random token of 128 characters
        }).save();

        res.json({
            success: false,
            message: `Bot added successfully. <a href='/bots/${botID}' class="btn btn-primary">View Bot</a>`
        });

        global.client.channels.cache.get(global.config.server.channels.botlogs).send({
            content: `<@&${global.config.server.roles.botReviewer}> | <@${req.user.id}>${coowners?.length ? `, ${coowners.map(u => `<@${u}>`).join(', ')}` : ''} submitted ${botUser.username}\n<${global.config.website.url}/bot/${botID}>`,
            allowedMentions: { users: [req.user.id].concat(coowners || []), roles: [global.config.server.roles.botReviewer] }
        });
    } catch (e) {
        concole.log(e.stack)
        return error(res, 'it seems like an error has occured, please try again later. (The administrators have been notified).');
    }
});

module.exports = app;
