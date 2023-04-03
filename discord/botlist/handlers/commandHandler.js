const { readdir } = require('fs/promises');

module.exports = async (client) => {
    for (const category of global.client.categories) {
        for (const file of await readdir(`./discord/botlist/commands/${category}`)) {
            if (file.indexOf(".js") == -1) continue;
            const command = (await import(`../commands/${category}/${file}`)).default;
            client.commands.set(command.name, command);
        }
    }
    console.success(`[Discord Bot List] Loaded ${client.commands.size} commands.`);
}