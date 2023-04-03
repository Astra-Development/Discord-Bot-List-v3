const app = require('express').Router();

console.success('[Servers] /servers/vote.js router loaded.'.brightYellow);
const votes = require("../../database/models/servers/vote.js");

app.post('/server/:id/vote', async (req, res) => {
    try {
        const ip = req.cf_ip;
        const ratelimit = ratelimitMap.get(ip);
        if (ratelimit && ((ratelimit + 5000) > Date.now())) return error(res, "You have reached your rate limit! Please try again in a few seconds.");
        else ratelimitMap.set(ip, Date.now());

        if (!req.user) return error(res, "You need to be logged in to vote!");

        let serverdata = await serversdata.findOne({
            serverID: req.params.id
        });

        if (!serverdata) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The bot you are looking for does not exist."
        });

        let voted = await votes.findOne({ userID: req.user.id, serverID: req.params.id });
        if (voted) {
            let timeLeft = 10800000 - (Date.now() - voted.Date);
            if (timeLeft > 0) {
                let hours = Math.floor(timeLeft / 3600000);
                let minutes = Math.floor((timeLeft % 3600000) / 60000);
                let seconds = Math.floor(((timeLeft % 3600000) % 60000) / 1000);
                let totalTime = `${hours > 0 ? `${hours} hours, ` : ""}${minutes > 0 ? `${minutes} minutes, ` : ""}${seconds > 0 ? `${seconds} seconds` : ""}`;
                return res.json({
                    error: true,
                    message: `You have already voted for this server. You can vote again in <strong>${totalTime}</strong>.`
                });
            }
        }

        await votes.findOneAndUpdate({ userID: req.user.id, serverID: req.params.id }, {
            $set: {
                Date: Date.now(),
            }
        }, {
            upsert: true
        });

        await serversdata.findOneAndUpdate({ serverID: req.params.id }, {
            $inc: {
                votes: 1
            }
        }, {
            upsert: true
        });

        setTimeout(async () => {
            await votes.deleteOne({ userID: req.user.id, serverID: req.params.id });
        }, 10800000); // 3 hours

        return res.json({
            error: false,
            message: "You have successfully voted for this server!"
        });
    } catch (e) {
        concole.log(e.stack)
        return error(res, 'it seems like an error has occured, please try again later. (The administrators have been notified).');
    }
});

module.exports = app;