module.exports = {
    name: 'delete',
    category: 'Owner',
    description: 'Delete a bot or a server from the database',
    options: [
        {
            name: "bot",
            type: 1,
            description: "Delete a bot or a server from the database",
            options: [
                {
                    name: "bot",
                    type: 6,
                    description: "The botId or @mention of the bot you want to delete",
                    required: true
                }
            ]
        }, {
            name: "server",
            type: 1,
            description: "Delete a bot or a server from the database",
            options: [
                {
                    name: "server",
                    type: 3,
                    description: "The serverID of the server you want to delete",
                    required: true
                }
            ]
        }
    ],
    run: async (interaction, client) => {
        try {
            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'bot') {
                const bot = interaction.options.get('bot')?.user;
                if (!bot) return interaction.reply({
                    embeds: [
                        {
                            title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Error ``',
                            description: 'You must provide a bot to delete.',
                            footer: null
                        }
                    ],
                    ephemeral: true
                });

                if (!bot.bot) return interaction.reply({
                    embeds: [
                        {
                            title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Error ``',
                            description: 'The user is not a bot.',
                            footer: null
                        }
                    ],
                    ephemeral: true
                });

                const botData = await botsdata.findOne({ botID: bot.id });
                if (!botData) return interaction.reply({
                    embeds: [
                        {
                            title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Error ``',
                            description: 'This bot does not exist in the database.',
                            footer: null
                        }
                    ],
                    ephemeral: true
                });

                const confirm = await interaction.reply({
                    embeds: [
                        {
                            title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Confirmation ``',
                            description: `Are you sure you want to delete <@${bot.id}> (\`${bot.id}\`) from the database?`,
                            footer: {
                                text: 'This confirmation will expire in 15 seconds.'
                            }
                        }
                    ],
                    fetchReply: true,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 3,
                                    label: 'Confirm',
                                    custom_id: 'bot_deletion_confirm'
                                },
                                {
                                    type: 2,
                                    style: 4,
                                    label: 'Cancel',
                                    custom_id: 'bot_deletion_cancel'
                                }
                            ]
                        }
                    ]
                });

                const filter = (i) => i.user.id === interaction.user.id;
                const collector = confirm.createMessageComponentCollector({ filter, time: 15000 });
                collector.on('collect', async (i) => {
                    if (i.customId === 'bot_deletion_confirm') {
                        await botsdata.deleteOne({ botID: bot.id });
                        await interaction.editReply({
                            embeds: [
                                {
                                    title: `${global.config.server.emojis.success ?? "✅"}` + ' `` Deletion Confirmation ``',
                                    description: `<@${bot.id}> (\`${bot.id}\`) has been deleted from the database.`,
                                    footer: null
                                }
                            ],
                            components: []
                        });
                        collector.stop(); // stop the collector
                    } else if (i.customId === 'bot_deletion_cancel') {
                        await interaction.editReply({
                            embeds: [
                                {
                                    title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Cancelled ``',
                                    description: `<@${bot.id}> (\`${bot.id}\`) has not been deleted from the database.`,
                                    footer: null
                                }
                            ],
                            components: []
                        });
                        collector.stop(); // stop the collector
                    }
                });

                collector.on('end', async (collected, reason) => {
                    if (reason === 'time') {
                        await interaction.editReply({
                            embeds: [
                                {
                                    title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Cancelled ``',
                                    description: `<@${bot.id}> (\`${bot.id}\`) has not been deleted from the database.`,
                                    footer: {
                                        text: 'This confirmation has expired.'
                                    }
                                }
                            ],
                            components: []
                        });
                    }
                });
            }

            if (subcommand === 'server') {
                const server = interaction.options.get('server')?.value;
                if (!server) return interaction.reply({
                    embeds: [
                        {
                            title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Error ``',
                            description: 'You must provide a server to delete.',
                            footer: null
                        }
                    ],
                    ephemeral: true
                });

                // check if the server exists in the database
                const serverData = await serversdata.findOne({ serverID: server });
                if (!serverData) return interaction.reply({
                    embeds: [
                        {
                            title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Error ``',
                            description: 'This server does not exist in the database.',
                            footer: null
                        }
                    ],
                    ephemeral: true
                });

                const confirm = await interaction.reply({
                    embeds: [
                        {
                            title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Confirmation ``',
                            description: `Are you sure you want to delete ${await serverClient?.guilds?.fetch(server).then((g) => g.name) || server} (\`${server}\`) from the database?`,
                            footer: {
                                text: 'This confirmation will expire in 15 seconds.'
                            }
                        }
                    ],
                    fetchReply: true,
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 3,
                                    label: 'Confirm',
                                    custom_id: 'server_deletion_confirm'
                                },
                                {
                                    type: 2,
                                    style: 4,
                                    label: 'Cancel',
                                    custom_id: 'server_deletion_cancel'
                                }
                            ]
                        }
                    ]
                });

                const filter = (i) => i.user.id === interaction.user.id;
                const collector = confirm.createMessageComponentCollector({ filter, time: 15000 });
                collector.on('collect', async (i) => {
                    if (i.customId === 'server_deletion_confirm') {
                        await serversdata.deleteOne({ serverID: server });
                        await interaction.editReply({
                            embeds: [
                                {
                                    title: `${global.config.server.emojis.success ?? "✅"}` + ' `` Deletion Confirmation ``',
                                    description: `${await serverClient?.guilds?.fetch(server).then((g) => g.name) || server} (\`${server}\`) has been deleted from the database.`,
                                    footer: null
                                }
                            ],
                            components: []
                        });
                        collector.stop(); // stop the collector
                    } else if (i.customId === 'server_deletion_cancel') {
                        await interaction.editReply({
                            embeds: [
                                {
                                    title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Cancelled ``',
                                    description: `${await serverClient?.guilds?.fetch(server).then((g) => g.name) || server} (\`${server}\`) has not been deleted from the database.`,
                                    footer: null
                                }
                            ],
                            components: []
                        });
                        collector.stop(); // stop the collector
                    }
                });

                collector.on('end', async (collected, reason) => {
                    if (reason === 'time') {
                        await interaction.editReply({
                            embeds: [
                                {
                                    title: `${global.config.server.emojis.error ?? "❌"}` + ' `` Deletion Cancelled ``',
                                    description: `${await serverClient?.guilds?.fetch(server).then((g) => g.name) || server} (\`${server}\`) has not been deleted from the database.`,
                                    footer: {
                                        text: 'This confirmation has expired.'
                                    }
                                }
                            ],
                            components: []
                        });
                    }
                });
            }
        } catch (err) {
            console.log(err);
            interaction.reply({
                content: 'An error occurred while using the delete command. ```bash\n' + err + '```',
                ephemeral: true
            });
        }
    }
}