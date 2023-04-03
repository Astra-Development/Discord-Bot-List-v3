module.exports = {
    name: 'bump',
    category: 'General',
    description: 'Bump your Discord server on Astrabots.xyz',
    options: [],
    run: async (interaction, serverClient) => {
        try {
            let serverdata = await serversdata.findOne({
                serverID: interaction.guild.id
            });

            const embed = {};
            if (!serverdata) {
                embed.title = `[Oops] Bumping ${interaction.guild.name}`;
                embed.description = "This server is not registered in our database. Please run the `register` command to register your server.";
                embed.color = 0xff0000; // Red
                return interaction.reply({
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
                    }], ephemeral: true
                });
            }

            let voted = await serverVotes.findOne({ userID: interaction.user.id, serverID: interaction.guild.id });
            if (voted) {
                let timeLeft = 10800000 - (Date.now() - voted.Date);
                if (timeLeft > 0) {
                    let hours = Math.floor(timeLeft / 3600000);
                    let minutes = Math.floor((timeLeft % 3600000) / 60000);
                    let seconds = Math.floor(((timeLeft % 3600000) % 60000) / 1000);
                    let totalTime = `${hours > 0 ? `${hours} hours, ` : ""}${minutes > 0 ? `${minutes} minutes, ` : ""}${seconds > 0 ? `${seconds} seconds` : ""}`;
                    return interaction.reply({
                        embeds: [{
                            title: "Bumping " + interaction.guild.name,
                            author: {
                                name: `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`,
                                icon_url: interaction.user.displayAvatarURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
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
                                    url: `${global.config.website.url}/servers/${interaction.guild.id}`,
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
                        }], ephemeral: true
                    });
                }
            }

            await serverVotes.findOneAndUpdate({ userID: interaction.user.id, serverID: interaction.guild.id }, {
                $set: {
                    Date: Date.now(),
                }
            }, {
                upsert: true
            });

            await serversdata.findOneAndUpdate({ serverID: interaction.guild.id }, {
                $inc: {
                    votes: 1
                }
            }, {
                upsert: true
            });

            setTimeout(async () => {
                await serverVotes.findOneAndDelete({ userID: interaction.user.id, serverID: interaction.guild.id });
            }, 10800000); // 3 hours

            return interaction.reply({
                embeds: [{
                    title: "Success!",
                    author: {
                        name: `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`,
                        icon_url: interaction.user.displayAvatarURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png'
                    },
                    description: `You have successfully bumped this server. Thank you for your support!`,
                    fields: [{
                        name: "Server",
                        value: `${interaction.guild.name} (${interaction.guild.id})`,
                    }, {
                        name: "Bumped By",
                        value: `${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`,
                    }, {
                        name: "Total Bumps",
                        value: `${serverdata.votes + 1}`,
                    }, {
                        name: `Next bump for ${interaction.user.username}#${interaction.user.discriminator}`,
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
                            url: `${global.config.website.url}/server/${interaction.guild.id}`,
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
        } catch (err) {
            console.log(err);
            interaction.reply({ content: 'An error occurred while trying to schedule this bot. ```bash\n' + err + '```' });
        }
    }
}