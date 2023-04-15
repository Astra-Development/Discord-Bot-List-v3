const mongoose = require("mongoose");
let hm = new mongoose.Schema({
    botID: String,
    appID: String,
    ownerID: String,
    coowners: Array,
    username: String,
    avatar: String,

    prefix: String,

    inviteURL: String,
    githubURL: String,
    websiteURL: String,
    supportURL: String,
    webhookURL: String,

    shortDesc: String,
    longDesc: String,

    tags: Array,
    status: {
        type: String,
        default: "unverified"
    },

    promote: {
        type: Boolean,
        default: false
    },

    rates: Object,
    Date: {
        type: Date,
        default: Date.now
    },
    votes: {
        type: Number,
        default: 0
    },

    token: String,
});

// const model = mongoose.model("bots", hm);
// model.findOneAndDelete = console.trace;
// module.exports = model;

module.exports = mongoose.model('bots', hm);
