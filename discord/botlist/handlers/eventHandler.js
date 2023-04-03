const { readdir } = require('fs/promises');

module.exports = async (client) => {
    readdir('./discord/botlist/events').then(async (files) => {
        const allevents = [];
        for (const file of files) {
            const event = require(`../events/${file}`);
            client.on(event.name, event.run.bind(null, client));
            allevents.push(event.name);
        }
        client.events = allevents;
        console.success(`[Discord Bot List] Loaded ${files.length} events.`);
    });
}