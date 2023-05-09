module.exports = {
    name: 'guildMemberRemove',
    run: async (client, member) => {
        try {
            if (member.guild.id !== global.config.server.id) return;
            const leaveChannel = global.config.server.channels.leave;
            if (!welcomeChannel) return;
            return global.client.channels.cache.get(leaveChannel).send({
                content: `Goodbye ${member.user.tag} *(${member.user.id})*! Server now has ${member.guild.memberCount} members.`,
                allowedMentions: { userS: [], roles: [] }
            });
        } catch (e) {
            console.log(e);
        }
    }
};