const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    Date: Date,
    botID: String,
    userID: String,
})

module.exports = mongoose.model('votes', schema)