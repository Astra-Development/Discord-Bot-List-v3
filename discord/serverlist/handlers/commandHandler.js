const { readdir } = require('fs/promises');

module.exports = async (serverClient) => {
    for (const category of global.serverClient.categories) {
        for (const file of await readdir(`./discord/serverlist/commands/${category}`)) {
            if (file.indexOf(".js") == -1) continue;
            const command = (await import(`../commands/${category}/${file}`)).default;
            serverClient.commands.set(command.name, command);
        }
    }
    console.success(`[Server Bot List] Loaded ${serverClient.commands.size} commands.`);
}