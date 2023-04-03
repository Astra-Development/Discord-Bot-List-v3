const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    Date: Date,
    serverID: String,
    userID: String,
})

module.exports = mongoose.model('server_votes', schema)