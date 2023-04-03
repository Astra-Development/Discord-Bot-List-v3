const app = require('express').Router();

const moment = require('moment');
const botsdata = require("../../database/models/bots/bots.js");

console.success('[Bots] /bots/bot.js router loaded.'.brightYellow);

app.get('/bot/:id', async (req, res) => {
    try {
        let botdata = await botsdata.findOne({
            botID: req.params.id
        });

        if (!botdata) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The bot you are looking for does not exist."
        });

        let supdata = "";
        if (botdata.support) {
            try {
                supdata = await client.fetchInvite(botdata.support);
            } catch (e) {
                supdata = "";
            }
        }

        let rateAuthors = new Array();
        try {
            for (let i = 0; i < botdata.rates.length; i++) {
                let rateAuthor = await client.users.fetch(botdata.rates[i].author);
                if (rateAuthor) rateAuthors.push(rateAuthor);
                else rateAuthors.push({
                    id: "0000000000",
                    username: "Unknown",
                    discriminator: "0000",
                    avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
                });
            }
        } catch (e) { }

        let owner = await client.users.fetch(botdata.ownerID);
        let coowners = new Array();
        try {
            for (let i = 0; i < botdata.coowners.length; i++) {
                let coownerUser = await client.users.fetch(botdata.coowners[i]);
                coowners.push(coownerUser);
            }
        } catch (e) { }

        // let openTags = botdata.longDesc.match(/<(?!\/)/g);
        // let closeTags = botdata.longDesc.match(/<\/(?!div)/g);
        // if (openTags && closeTags) {
        //     if (openTags.length > closeTags.length) {
        //         for (let i = 0; i < openTags.length - closeTags.length; i++) {
        //             botdata.longDesc += '</div>';
        //         }
        //     }
        // }

        res.render('bots/bot', {
            bot: global.client ? global.client : null,
            server: global.serverClient,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            rateAuthors: rateAuthors,
            owner: owner,
            coowners: coowners,
            req: req,
            botdata: botdata,
            supdata: supdata,
            moment: moment,
            botsdata: await botsdata.find(),
        });
    } catch (e) {
        res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "it seems like an error has occured, please try again later. (The administrators have been notified)."
        });
        concole.log(e.stack)
    }
});

module.exports = app;