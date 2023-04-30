module.exports = {
    name: 'schedule',
    category: 'Owner',
    description: 'Promote bots for a certain amount of time.',
    options: [
        {
            type: 6,
            name: 'bot',
            description: 'The bot to promote.',
            required: true,
        }, {
            type: 3,
            name: 'time',
            description: 'The time to promote the bot for.',
            required: true,
            choices: [
                {
                    name: '1 minute',
                    value: '1m'
                }, {
                    name: '5 minute',
                    value: '5m'
                }, {
                    name: '10 minute',
                    value: '10m'
                }, {
                    name: '20 minutes',
                    value: '20m'
                }, {
                    name: '1 hour',
                    value: '1h'
                }, {
                    name: '2 hours',
                    value: '2h'
                }, {
                    name: '1 day',
                    value: '1d'
                }, {
                    name: '2 days',
                    value: '2d'
                }, {
                    name: '1 week',
                    value: '1w'
                }, {
                    name: '2 weeks',
                    value: '2w'
                }, {
                    name: '1 month',
                    value: '1mo'
                }, {
                    name: '2 months',
                    value: '2mo'
                }, {
                    name: '3 months',
                    value: '3mo'
                }
            ]
        }, {
            type: 3,
            name: 'status',
            description: 'The status to set the bot to.',
            required: true,
            choices: [
                {
                    name: 'promote',
                    value: 'promote'
                }
            ]
        }
    ],
    run: async (interaction, client) => {
        try {
            if (!global.config.client.owners.includes(interaction.user.id)) return;

            const bot = interaction.options.get('bot').user;
            let time = interaction.options.get('time').value;
            let status = interaction.options.getString('status').value ? interaction.options.getString('status').value : 'promote';

            if (!bot.bot) return interaction.reply({ content: 'The user is not a bot.' });

            let botdata = await botsdata.findOne({ botID: bot.id });
            if (!botdata) return interaction.reply({ content: 'This bot does not exist.' });

            let schedule = await schedules.findOne({ botID: bot.id, type: status });
            if (schedule) {
                const embed = {};
                embed.title = 'Bot Schedules';
                embed.description = `This bot already has a schedule for ${status}.`;
                embed.color = 0x5865F2;
                embed.fields = [];
                embed.fields.push({
                    name: status.charAt(0).toUpperCase() + status.slice(1),
                    value: `- Mod: <@${schedule.moderator}> (${schedule.moderator})\n- From Date: ${new Date(schedule.fromDate).toLocaleString()}\n- To Date: ${new Date(schedule.toDate).toLocaleString()}`
                });
                return interaction.reply({ embeds: [embed] });
            }

            let timeNumber = time.replace(/\D/g, '');
            let timeType = time.replace(/\d/g, '');
            if (timeType === 'm') time = Math.floor((timeNumber * 60) * 1000); // minutes
            if (timeType === 'h') time = Math.floor((timeNumber * 60 * 60) * 1000); // hours
            if (timeType === 'd') time = Math.floor((timeNumber * 60 * 60 * 24) * 1000); // days
            if (timeType === 'w') time = Math.floor((timeNumber * 60 * 60 * 24 * 7) * 1000); // weeks
            if (timeType === 'mo') time = Math.floor((timeNumber * 60 * 60 * 24 * 30) * 1000); // months

            let newSchedule = await (new schedules({
                botID: bot.id,
                moderator: interaction.user.id,
                fromDate: Date.now(),
                toDate: Date.now() + time,
                type: status
            })).save();

            await botsdata.findOneAndUpdate({ botID: bot.id }, { promote: true });

            interaction.reply({
                content: `Successfully scheduled ${bot.tag} to ${status} for **${timeNumber}${timeType === 'm' ? ' minute' : timeType === 'h' ? ' hour' : timeType === 'd' ? ' day' : timeType === 'w' ? ' week' : timeType === 'mo' ? ' month' : ''}${timeNumber > 1 ? 's' : ''}**.`
                // ephemeral: true
            });

            setTimeout(async () => {
                let duration = newSchedule.toDate - newSchedule.fromDate;
                let totalTime = Math.floor(duration / 1000);
                let seconds = totalTime % 60;
                let minutes = Math.floor(totalTime / 60) % 60;
                let hours = Math.floor(totalTime / 3600) % 24;
                let days = Math.floor(totalTime / 86400);
                let months = Math.floor(totalTime / 2592000);
                let durationString = '';
                if (months > 0) durationString += `${months} month${months > 1 ? 's' : ''}`;
                if (days > 0) durationString += `${days} day${days > 1 ? 's' : ''}`;
                if (hours > 0) durationString += `${hours} hour${hours > 1 ? 's' : ''}`;
                if (minutes > 0) durationString += `${minutes} minute${minutes > 1 ? 's' : ''}`;
                if (seconds > 0) durationString += `${seconds} second${seconds > 1 ? 's' : ''}`;

                const embed = {};
                embed.title = `Bot Schedule Ended - (${durationString})`;
                embed.description = `**${botdata.username}**'s promote schedule has been removed.`;
                embed.color = 0xED4245;
                embed.fields = [];
                embed.fields.push({
                    name: 'Bot',
                    value: `[${botdata.username}](${global.config.website.url}/bot/${botdata.botID})`,
                    inline: true
                });
                embed.fields.push({
                    name: 'Type',
                    value: status.charAt(0).toUpperCase() + status.slice(1),
                    inline: true
                });
                embed.fields.push({
                    name: 'Details',
                    value: `- Mod: ${(await client.users.fetch(newSchedule.moderator)).tag}\n- From Date: ${new Date(newSchedule.fromDate).toLocaleString()}\n- To Date: **${new Date(newSchedule.toDate).toLocaleString()}**`
                });
                client.channels.cache.get(global.config.server.channels.schedules).send({
                    content: `The schedule for <@${newSchedule.botID}> has ended.`,
                    embeds: [embed],
                    allowedMentions: { parse: ['users', 'roles'] }
                });

                await botsdata.findOneAndUpdate({ botID: bot.id }, { promote: '' });
                await botSchedules.deleteOne({ botID: bot.id, type: status });
            }, time);
        } catch (err) {
            console.log(err);
            interaction.reply({ content: 'An error occurred while trying to schedule this bot. ```bash\n' + err + '```' });
        }
    }
}
