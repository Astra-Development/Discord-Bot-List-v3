const moment = require('moment');
(async () => {
    const schedules = await global.schedules.find();
    for (const schedule of schedules) {
        if (schedule.toDate < Date.now()) {
            await global.schedules.deleteOne({ _id: schedule._id });
        } else {
            let time = schedule.toDate - Date.now();
            setTimeout(async () => {
                let botdata = await global.botsdata.findOne({ botID: schedule.botID });
                let moderator = await client.users.fetch(schedule.moderator);
                if (schedule.type === 'promote') {
                    let duration = schedule.toDate - schedule.fromDate;
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
                        value: schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1),
                        inline: true
                    });
                    embed.fields.push({
                        name: 'Details',
                        value: `- Mod: <@${moderator.id}> (${moderator.id})\n- From Date: ${new Date(schedule.fromDate).toLocaleString()}\n- To Date: **${new Date(schedule.toDate).toLocaleString()}**`
                    });
                    client.channels.cache.get(global.config.server.channels.schedules).send({
                        content: `The schedule for <@${schedule.botID}> has ended.`,
                        embeds: [embed],
                        allowedMentions: { parse: ['users', 'roles'] }
                    });

                    await botsdata.findOneAndUpdate({ botID: botdata.botID }, { promote: false });
                    await schedule.deleteOne({ botID: botdata.botID, type: 'promote' });
                }
            }, time);
        }
    }
})();
