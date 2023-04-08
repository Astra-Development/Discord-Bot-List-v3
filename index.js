console.clear();
require("cute-logs");
const url = require("url");
const ejs = require("ejs");
const path = require("path");
const express = require('express');
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const app = express();
const fetch = require("node-fetch");
const { WebhookClient } = require("discord.js");

// GLOBAL DATABASE
const botsdata = require("./database/models/bots/bots.js");
global.botsdata = botsdata;
const botVotes = require("./database/models/bots/vote.js");
global.botVotes = botVotes;

const serversdata = require("./database/models/servers/server.js");
global.serversdata = serversdata;
const serverVotes = require("./database/models/servers/vote.js");
global.serverVotes = serverVotes;

const schedules = require("./database/models/bots/schedules.js");
global.schedules = schedules;

const siteanalytics = require("./database/site-analytics.js");
global.siteanalytics = siteanalytics;

const ratelimitMap = new Map();
global.ratelimitMap = ratelimitMap;

botsdata.watch().on("change", data => {
    global.client.channels.cache.get("1024335635756105878").send({
        content: `**Bot Data Changed** [${data.operationType} - ${data.documentKey._id}]`,
        files: [{
            attachment: Buffer.from(JSON.stringify(data.fullDocument ? data.fullDocument : data, null, 4)),
            name: "data.json"
        }]
    })
});

serversdata.watch().on("change", data => {
    global.client.channels.cache.get("1024335635756105878").send({
        content: `**Server Data Changed** [${data.operationType} - ${data.documentKey._id}]`,
        files: [{
            attachment: Buffer.from(JSON.stringify(data.fullDocument ? data.fullDocument : data, null, 4)),
            name: "data.json"
        }]
    })
});

function error(res, message = 'Bad Request', _code = 400) {
    res.json({ error: true, message })
};
global.error = error;

global.resolveAvatarURL = function resolveAvatarURL(user) {
    return user.avatar ? client.rest.cdn.avatar(user.id, user.avatar, { format: 'png' }) : client.rest.cdn.defaultAvatar(user.discriminator % 5);
}

global.executeVoteWebhook = async function executeVoteWebhook(user, botdata) {
    if (!user || !botdata || !botdata.webhookURL) return false;
    let bot;
    try {
        bot = global.client.users.cache.get(botdata.botID) ?? await global.client.users.fetch(botdata.botID);
    } catch {
        return false;
    }

    try {
        await new WebhookClient({ url: botdata.webhookURL }).send({
            embeds: [{
                author: {
                    name: bot.tag,
                    icon_url: resolveAvatarURL(bot)
                },
                title: 'AstraBots.xyz | Bot vote',
                url: `${global.config.website.url}/bot/${bot.id}`,
                fields: [{
                    name: 'User',
                    value: `${user.username}#${user.discriminator} - ${user.id}`
                }, {
                    name: 'Bot',
                    value: `${bot.tag} - ${bot.id}`
                }, {
                    name: 'Vote count',
                    value: botdata.votes.toLocaleString()
                }],
                footer: {
                    text: `Voted by ${user.username}#${user.discriminator}`,
                    icon_url: resolveAvatarURL(user)
                },
                timestamp: new Date(),
                color: Math.trunc(Math.random() * 0xffffff)
            }],
            username: "AstraBots.xyz",
            avatarURL: client.user.avatarURL()
        });
        return true;
    } catch (error) {
        if (error.code != 10015) {
            console.error("Error while executing a vote webhook |", error);
            return false;
        }
        try {
            await botsdata.findOneAndUpdate({ botID: bot.id }, { $unset: { webhookURL: "" } });
            global.client.channels.cache.get(global.config.server.channels.botlogs).send({
                content: `<@${botdata.ownerID}>${botdata.coowners?.length ? `, ${botdata.coowners.map(u => `<@${u}>`).join(', ')}` : ''}, <@${botdata.botID}>'s voting webhookURL has been deleted.\nReason: [Auto] The webhookURL for the voting system seems to be unavailable.`,
                allowedMentions: { users: [botdata.ownerID].concat(botdata.coowners || []), roles: [] }
            });
        } catch (error) {
            console.error("Error while deleting a webhookURL |", error);
        }
        return false;
    }
}

module.exports = async (client) => {
    const store = new MongoStore({
        uri: global.config.database.url,
        collection: "sessions"
    });

    app.use(session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            // 24 hours
            maxAge: 86400000 // 1 day
        }
    }));

    const templateDir = path.resolve(`${process.cwd()}${path.sep}/views`);
    app.get("/arc-sw.js", (req, res) => {
        res.sendFile(path.join(__dirname, "/views/assets/js/arc-sw.js"));
    });
    app.get("/ads.txt", (req, res) => {
        res.sendFile(path.join(__dirname, "/views/assets/ads.txt"));
    });
    app.use('/assets', express.static(path.resolve(`${templateDir}${path.sep}/assets`)));

    var minify = require('express-minify');
    app.use(minify({
        cache: path.resolve(`${templateDir}${path.sep}/assets`)
    }));

    // ===== PASSPORT ===== //
    const passport = require("passport");
    const DiscordStrategy = require('passport-discord').Strategy;
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    passport.use(new DiscordStrategy({
        clientID: config.client.id,
        clientSecret: config.client.secret,
        callbackURL: config.website.callback,
        scope: ['identify', 'guilds']
        // scope: ['identify', 'guilds', 'guilds.join']
    }, (_accessToken, _refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    app.use(express.json());
    app.use(passport.initialize());
    app.use(passport.session());

    app.engine("ejs", ejs.renderFile);
    app.set("view engine", "ejs");

    app.get("/login", (req, _res, next) => {
        if (req.session.backURL) {
            req.session.backURL = req.session.backURL;
        } else if (req.headers.referer) {
            const parsed = url.parse(req.headers.referer);
            if (parsed.hostname === app.locals.domain) {
                req.session.backURL = parsed.path;
            }
        } else {
            req.session.backURL = "/";
        }
        next();
    }, passport.authenticate("discord"));

    app.get("/callback", passport.authenticate("discord", {
        failureRedirect: "/"
    }), async (req, res) => {
        try {
            fetch(`https://discordapp.com/api/v8/guilds/${config.server.id}/members/${req.user.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bot ${config.client.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    access_token: req.user.accessToken
                })
            });
        } catch (e) {
            console.log(e);
        }
        if (req.session.backURL) {
            const url = req.session.backURL;
            req.session.backURL = null;
            res.redirect(url);
        } else {
            res.redirect("/");
        }

        let countryMessage;
        try {
            var getIP = require('ipware')()?.get_ip;
            var ipInfo = getIP(req);
            var geoip = require('geoip-lite');
            var ip = ipInfo.clientIp;
            var geo = geoip.lookup(ip);
            const lookup = require('country-code-lookup')
            let countryCode = lookup?.byIso(geo.country) ?? null
            let countryName = countryCode.country
            countryMessage = `:flag_${geo.country.toLowerCase()}: (${geo.country}) ${countryName}`
        } catch (e) {
            countryMessage = "Unknown"
        }

        const embed = {
            author: {
                name: `${req.user.username}#${req.user.discriminator}`,
                icon_url: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
            },
            description: `[${req.user.username}#${req.user.discriminator}](${global.config.website.url}/profile/${req.user.id}) has logged in from ${countryMessage}`,
            color: 0x00FF00
        };

        client.channels.cache.get(config.server.channels.login).send({
            embeds: [embed],
            allowedMentions: { parse: ['users', 'roles'] }
        });
    });

    app.get("/logout", async (req, res) => {
        try {
            if (!req.user) return res.redirect("/");
            const embed = {};
            embed.author = {
                name: `${req.user.username}#${req.user.discriminator}`,
                icon_url: `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
            };
            embed.description = `[${req.user.username}#${req.user.discriminator}](${global.config.website.url}/profile/${req.user.id}) has logged out.`;
            embed.color = 0xFF0000;
            client.channels.cache.get(config.server.channels.login).send({
                embeds: [embed],
                allowedMentions: { parse: ['users', 'roles'] }
            });
            req.logout(function (err) {
                if (err) { return next(err); }
                res.redirect('/');
            });
        } catch (e) {
            res.status(500).render("404", {
                bot: global.client ? global.client : null,
                path: req.path,
                user: req.isAuthenticated() ? req.user : null,
                req: req,
                message: "it seems like an error has occured, please try again later. Please contact the support team if the problem persists."
            })
            console.log(e);
        }
    });

    // ====== ROUTES ====== //
    const fs = require("fs");
    require("colors");
    console.log("===============================".white);
    console.log("       Loading Routes...".red);
    // for each category add console log with "================="
    fs.readdirSync('./routes').forEach(async file => {
        console.log("===============================".white);
        if (fs.lstatSync(`./routes/${file}`).isDirectory()) {
            console.success(`Loading ${file} routes...`.white);
            fs.readdirSync(`./routes/${file}`).forEach(file2 => {
                const route = require(`./routes/${file}/${file2}`);
                app.use(route);
            });
        } else {
            const route = require(`./routes/${file}`);
            app.use(route);
        }
    });

    app.use(async (req, res, next) => {
        var getIP = require('ipware')().get_ip;
        var ipInfo = getIP(req);
        var geoip = require('geoip-lite');
        var ip = ipInfo.clientIp;
        var geo = geoip.lookup(ip);
        if (geo) {
            let analytics = siteanalytics.find();
            await analytics.updateOne({
                id: global.config.client.id
            }, {
                $inc: {
                    [`country.${geo.country}`]: 1
                }
            }, {
                upsert: true
            })
        }
        return next();
    })

    app.use(async (err, req, res, next) => {
        if (err) {
            console.log(err);
            return res.status(500).render('404', {
                bot: global.client ? global.client : null,
                path: req.path,
                user: req.isAuthenticated() ? req.user : null,
                req: req,
                message: 'it seems like an error has occured, please try again later. Please contact the support team if the problem persists.'
            })
        }
        return next();
    });

    app.get('*', function (req, res) {
        return res.status(404).render("404", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The page you're looking for doesn't exist."
        })
    });

    console.log("===============================".white);
    const checkers = require("fs").readdirSync("./checkers").filter(file => file.endsWith(".js"));
    for (const file of checkers) {
        require(`./checkers/${file}`);
    }

    const http = require("http").createServer(app);
    http.listen(config.website.port, () => {
        console.success(`[Website] Website is online on port ${config.website.port}.`);
    });
}
