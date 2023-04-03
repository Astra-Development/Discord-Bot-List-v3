const app = require("express").Router();

console.success("[TOS] /tos router loaded.".bgYellow.black);

app.get('/tos', (req, res) => {
    res.render('more/tos', {
        bot: global.client ? global.client : null,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        req: req,
    });
});

module.exports = app;