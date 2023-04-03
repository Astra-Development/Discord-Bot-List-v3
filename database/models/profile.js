const mongoose = require("mongoose");
let hm = new mongoose.Schema({
  userID: String,
  biography: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("profiles", hm);