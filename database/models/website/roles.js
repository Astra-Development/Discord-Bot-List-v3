const mongoose = require("mongoose");
let roles = new mongoose.Schema({
    administator: Array,
    moderator: Array,
});

module.exports = mongoose.model("websiteRoles", roles);