const { serverClient } = require('../../config');

const app = require('express').Router();

console.success('[Servers] /servers/new.js router loaded.'.brightYellow);

app.get('/servers/new', async (req, res) => {
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

    res.render('servers/new', {
        bot: global.client ? global.client : null,
        sbot: global.sbot,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
        serversdata: await global.serversdata
    });
});

app.post('/servers/new', async (req, res) => {
    try {
        if (!req.user) return res.render('404.ejs', {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: 'You must be logged in to add a bot.'
        });

        let {
            serverID,
            inviteURL,
            shortDesc,
            longDesc,
            tags
        } = req.body;

        const serverdata = await serversdata.findOne({
            serverID: serverID
        });

        if (!serverID) return error(res, 'Please provide a server ID.');
        let guildCache = global.serverClient.guilds.cache.get(serverID);
        if (!guildCache) return error(res, `It seems like our bot is not in this server. You must invite me to the server before adding it. <a href="${global.config.serverClient.invite}&disable_guild_select=true&guild_id=${serverID}" target="_blank">Invite me</a>`);
        if (!guildCache.members.cache.get(req.user.id).permissions.has("MANAGE_GUILD")) return error(res, 'You do not have the required permissions to add this server. <strong>[MANAGE_GUILD]</strong>');

        if (serverdata) return error(res, 'This server is already in the database.');
        if (!inviteURL) return error(res, '<strong>[Invite URL]</strong> is required.');
        if (inviteURL) {
            try {
                let invite = await global.client.fetchInvite(inviteURL);
                if (!invite.guild) return error(res, '<strong>[Invite URL]</strong> is not a valid server invite.');
            } catch (e) {
                return error(res, '<strong>[Invite URL]</strong URL> is not a valid server invite.');
            }
        }

        longDesc = longDesc.trim();
        shortDesc = shortDesc.trim();

        if (!shortDesc || typeof (shortDesc) !== "string") return error(res, '<strong>[Short Description]</strong> is required.');
        if (!longDesc || typeof (longDesc) !== "string") return error(res, '<strong>[Long Description]</strong> is required.');

        if (shortDesc.length < 50 || shortDesc.length > 200) return error(res, '<strong>[Short Description]</strong> must be between 50 and 200 characters.');
        if (longDesc.length < 500 || longDesc.length > 5000) return error(res, '<strong>[Long Description]</strong> must be between <strong>500</strong> and <strong>5000</strong> characters.');

        if (!tags || typeof (tags) != 'object' || !Array.isArray(tags)) return error(res, '<strong>[Tags]</strong> is required.');
        if (!tags.every(tag => config.website.serverTags.includes(tag))) return error(res, `<strong>[Tags]</strong> must be one of the following: ${config.website.serverTags.map(tag => `<code>${tag}</code>`).join(', ')}`);
        if (tags.length < 3) return error(res, '<strong>[Tags]</strong> must be at least 3.');
        if (tags.length > 7) return error(res, '<strong>[Tags]</strong> you cannot exceed 7 tags.');

        await new serversdata({
            serverID: serverID,
            ownerID: req.user.id,
            inviteURL: inviteURL,
            shortDesc: shortDesc,
            longDesc: longDesc,
            tags: tags,
            date: Date.now(),
        }).save();

        res.json({
            success: false,
            message: `Your server has been added to the database. <a href='/servers/${serverID}' class="btn btn-primary">View Server</a>`
        });

        global.client.channels.cache.get(global.config.server.channels.botlogs).send({
            content: `<@${req.user.id}> submitted ${guildCache.name}\n<${global.config.website.url}/server/${serverID}>`,
            allowedMentions: { users: [req.user.id], roles: [] }
        });
    } catch (e) {
        error(res, 'it seems like an error has occured, please try again later. (The administrators have been notified).');
        console.log(e.stack)
    }
});

module.exports = app;