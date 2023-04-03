const util = require("util");
const exec = util.promisify(require("child_process").exec);

module.exports = {
    name: "exec",
    category: "Owner",
    cooldown: 2,
    usage: "exec <cote>",
    description: "Executes your Text",
    run: async (client, message, args) => {
        try {
            if (!global.config.client.owners.includes(message.author.id)) return;

            let command = args.join(" ");
            let embed = {};
            embed.title = "Exec";
            embed.color = 0x00ff00;
            
            try {
                let { stdout, stderr } = await exec(command);
                embed.description = "```js\n" + clean(stdout) + "```";
                if (embed.description.length > 2000) {
                    message.channel.send({
                        files: [{
                            attachment: Buffer.from(stdout),
                            name: "exec.txt"
                        }]
                    });
                }
            } catch (e) {
                embed.description = "```js\n" + clean(e) + "```";
                if (embed.description.length > 2000) {
                    message.channel.send({
                        files: [{
                            attachment: Buffer.from(e),
                            name: "exec.txt"
                        }]
                    });
                }
            }
            message.channel.send({
                embeds: [embed]
            });
        } catch (err) {
            message.channel.send(`There was an error while executing!\n\`\`\`js\n${error.stack}\n\`\`\``);
        }
    },
};

const clean = (text) => {
    if (typeof text === "string")
        return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
};

