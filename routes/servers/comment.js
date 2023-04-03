const app = require('express').Router();

console.success("[Servers] /servers/comment.js router loaded.".brightYellow);

app.post("/servers/comment", async (req, res) => {
    try {
        if (!req.user) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "You must be logged in to comment on a bot."
        });

        const ip = req.cf_ip;
        const ratelimit = ratelimitMap.get(ip);
        if (ratelimit && ((ratelimit + 5000) > Date.now())) return error(res, 'You have reached your rate limit! Please try again in a few seconds.');
        ratelimitMap.set(ip, Date.now());

        let { serverID, comment, stars } = req.body;
        console.log(req.body);

        const serverdata = await serversdata.findOne({
            serverID: serverID
        });

        if (!serverdata) return res.render("404.ejs", {
            bot: global.client ? global.client : null,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            req: req,
            message: "The bot you are looking for does not exist."
        });

        if (serverdata.ownerID == req.user.id) return error(res, "You cannot comment on your own server.");

        if (serverdata?.rates?.length > 0) {
            let find = serverdata.rates.find(rate => rate.author === req.user.id);
            if (find) return error(res, "You have already rated this bot.");
        }

        comment.trim();
        if (!comment || typeof comment !== "string") return error(res, "Make sure you have entered <strong>comment</strong>.");
        if (!stars || typeof (stars) !== "string") return error(res, "Make sure you have entered <strong>stars</strong>.");
        if (comment.length > 100) return error(res, "Your comment is too long. Please make sure it is less than <strong>100</strong> characters.");

        let comment_id = require("crypto").randomBytes(16).toString("hex");
        await serversdata.updateOne({
            serverID: serverID
        }, {
            $push: {
                rates: {
                    author: req.user.id,
                    star_rate: stars,
                    message: comment,
                    id: comment_id,
                    date: Date.now()
                }
            }
        }, {
            upsert: true
        });

        return res.json({
            error: false,
            author: req.user.id,
            star_rate: stars,
            id: comment_id,
            stars: [1, 2, 3, 4, 5],
            message: "Comment added successfully."
        });
    } catch (e) {
        concole.log(e.stack)
        return error(res, "it seems like an error has occured, please try again later. (The administrators have been notified).");
    }
});


module.exports = app;
