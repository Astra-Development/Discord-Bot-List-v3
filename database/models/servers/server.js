const mongoose = require("mongoose");
let hm = new mongoose.Schema({
    serverID: String,
    inviteURL: String,
    ownerID: String,
    longDesc: String,
    shortDesc: String,
    tags: Array,
    
    votes: {
        type: Number,
        default: 0
    },
    Date: {
        type: Date,
        default: Date.now
    },
    rates: Object
})
module.exports = mongoose.model("servers", hm);