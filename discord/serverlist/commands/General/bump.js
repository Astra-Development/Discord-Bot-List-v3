module.exports = {
    name: "bump",
    category: "General",
    cooldown: 4,
    usage: "bump",
    description: "Bumps the server",
    isCommand: true,
    run: async (serverClient, message, args) => {
        try {
            const votes = require("../../../../database/models/servers/vote.js");

            let serverdata = await serversdata.findOne({
                serverID: message.guild.id
            });

            const embed = {};
            if (!serverdata) {
                embed.title = `[Oops] Bumping ${message.guild.name}`;
                embed.description = "This server is not registered in our database. Please run the `register` command to register your server.";
                embed.color = 0xff0000; // Red
                return message.channel.send({
                    embeds: [embed],
                    components: [{
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: 5,
                                label: "Add Server",
                                url: `${global.config.website.url}/servers`,
                                disabled: global.config.website.url ? false : true,
                                emoji: {
                                    name: "🔗"
                                }
                            }, {
                                type: 2,
                                style: 5,
                                label: "Invite",
                                url: `https://discord.com/api/oauth2/authorize?client_id=${global.serverClient.user.id}&permissions=1&scope=bot%20applications.commands`,
                                emoji: {
                                    name: "🤖"
                                }
                            }, {
                                type: 2,
                                style: 5,
                                label: "Support",
                                url: `${global.config.website.support}`,
                                emoji: {
                                    name: "✋"
                                }
                            }]
                    }]
                });
            }

            let voted = await votes.findOne({ userID: message.author.id, serverID: message.guild.id });
            if (voted) {
                let timeLeft = 10800000 - (Date.now() - voted.Date);
                if (timeLeft > 0) {
                    let hours = Math.floor(timeLeft / 3600000);
                    let minutes = Math.floor((timeLeft % 3600000) / 60000);
                    let seconds = Math.floor(((timeLeft % 3600000) % 60000) / 1000);
                    let totalTime = `${hours > 0 ? `${hours} hours, ` : ""}${minutes > 0 ? `${minutes} minutes, ` : ""}${seconds > 0 ? `${seconds} seconds` : ""}`;
                    return message.channel.send({
                        embeds: [{
                            title: "Bumping " + message.guild.name,
                            author: {
                                name: `${message.author.tag} (${message.author.id})`,
                                icon_url: message.author.displayAvatarURL()
                            },
                            description: `You have already bumped this server. Please wait ${totalTime} before bumping again.`,
                            color: 0xff0000 // Red
                        }],
                        components: [{
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 5,
                                    label: "Visit Server",
                                    url: `${global.config.website.url}/servers/${message.guild.id}`,
                                    emoji: {
                                        name: "🔗"
                                    }
                                }, {
                                    type: 2,
                                    style: 5,
                                    label: "Add your server",
                                    url: `${global.config.website.url}/servers`,
                                    emoji: {
                                        name: "➕"
                                    }
                                }
                            ]
                        }]
                    });
                }
            }

            await votes.findOneAndUpdate({ userID: message.author.id, serverID: message.guild.id }, {
                $set: {
                    Date: Date.now(),
                }
            }, {
                upsert: true
            });

            await serversdata.findOneAndUpdate({ serverID: message.guild.id }, {
                $inc: {
                    votes: 1
                }
            }, {
                upsert: true
            });

            setTimeout(async () => {
                await votes.findOneAndDelete({ userID: message.author.id, serverID: message.guild.id });
            }, 10800000); // 3 hours

            return message.channel.send({
                embeds: [{
                    title: "Success!",
                    author: {
                        name: `${message.author.tag} (${message.author.id})`,
                        icon_url: message.author.displayAvatarURL() || 'https://cdn.discordapp.com/embed/avatars/0.png'
                    },
                    description: `You have successfully bumped this server. Thank you for your support!`,
                    fields: [{
                        name: "Server",
                        value: `${message.guild.name} (${message.guild.id})`,
                    }, {
                        name: "Bumped By",
                        value: `${message.author.tag} (${message.author.id})`,
                    }, {
                        name: "Total Bumps",
                        value: `${serverdata.votes + 1}`,
                    }, {
                        name: `Next bump for ${message.author.tag}`,
                        value: `In 3 hours`,
                    }],
                    color: 0x00ff00 // Green
                }],
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 5,
                            label: "Visit Server",
                            url: `${global.config.website.url}/server/${message.guild.id}`,
                            emoji: {
                                name: "🔗"
                            }
                        }, {
                            type: 2,
                            style: 5,
                            label: "Invite",
                            url: `https://discord.com/api/oauth2/authorize?client_id=${global.serverClient.user.id}&permissions=1&scope=bot%20applications.commands`,
                            emoji: {
                                name: "🤖"
                            }
                        }, {
                            type: 2,
                            style: 5,
                            label: "Add Server",
                            url: `${global.config.website.url}/servers`,
                            disabled: global.config.website.url ? false : true,
                            emoji: {
                                name: "🔗"
                            }
                        }
                    ]
                }]
            });
        } catch (e) {
            console.log(String(e.stack).bgRed)
        }
    }
};