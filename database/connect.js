const mongoose = require('mongoose');

module.exports = async () => {
    mongoose.connect(global.config.database.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.success('[MongoDB] Connected to database!'.green);
    }).catch((err) => {
        console.error('[MongoDB] An error occurred while connecting to the database!'.red.bold);
    });
}