const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    botID: {
        type: String,
        required: true
    },
    moderator: {
        type: String,
        required: true
    },
    fromDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    toDate: {
        type: Date,
        default: String,
        required: true
    },
    type: {
        type: String,
        default: "",
        required: true
    },
})

module.exports = mongoose.model('schedules', schema)