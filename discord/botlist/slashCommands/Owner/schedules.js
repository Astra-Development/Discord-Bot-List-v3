module.exports = {
    name: 'schedules',
    category: 'Owner',
    description: 'View all scheduled promotions.',
    options: [],
    run: async (interaction, client) => {
        try {
            const schedules = await global.schedules.find();
            if (schedules.length === 0) return interaction.reply({ content: 'There are no scheduled promotions.', ephemeral: true });
            const embed = {};
            embed.title = 'Scheduled Promotions';
            embed.description = 'The following bots have scheduled promotions.';
            embed.color = 0x5865F2;
            embed.fields = [];
            for (const schedule of schedules) {
                let botdata = await global.botsdata.findOne({ botID: schedule.botID });
                let moderator = await client.users.fetch(schedule.moderator);
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
                embed.fields.push({
                    name: `${botdata.username} - ${botdata.botID} (${durationString})`,
                    value: `- Mod: <@${moderator.id}> (${moderator.id})\n- From Date: ${new Date(schedule.fromDate).toLocaleString()}\n- To Date: **${new Date(schedule.toDate).toLocaleString()}**`
                });
            }
            interaction.reply({
                embeds: [embed],
                // ephemeral: true
            });
        } catch (error) {
            console.log(error);
            interaction.reply({ content: 'An error occurred while fetching the scheduled promotions.', ephemeral: true });
        }
    }
};

