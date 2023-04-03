module.exports = async (serverClient) => {
    const { readdirSync } = require("fs");

    let slash = []

    const commandFolders = readdirSync("./discord/serverlist/slashCommands");
    for (const folder of commandFolders) {
        const commandFiles = readdirSync(`./discord/serverlist/slashCommands/${folder}`).filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
            const command = require(`../slashCommands/${folder}/${file}`);
            if (command.name) {
                serverClient.slashCommands.set(command.name, command);
                console.log(command.name)
                slash.push(command)
            } else {
                continue;
            }
        }
    }
    serverClient.once("ready", async () => {
        await serverClient.application.commands.set(slash)
    })
}