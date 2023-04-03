const { readdir } = require('fs/promises');

module.exports = async (serverClient) => {
    readdir('./discord/serverlist/events').then(async (files) => {
        const allevents = [];
        for (const file of files) {
            const event = require(`../events/${file}`);
            serverClient.on(event.name, event.run.bind(null, serverClient));
            allevents.push(event.name);
        }
        serverClient.events = allevents;
        console.success(`[Discord Server List] Loaded ${files.length} events.`);
    });
}