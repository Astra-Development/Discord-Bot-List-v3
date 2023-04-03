module.exports = {
    name: 'guildMemberRemove',
    run: async (client, member) => {
        try {
            if (member.guild.id !== global.config.server.id) return;
            const welcomeChannel = global.config.server.channels.welcome;

            if (!welcomeChannel) return;
            return global.client.channels.cache.get("1058377673241538640").send({
                content: `Goodbye ${member.user.tag} *(${member.user.id})*! Server now has ${member.guild.memberCount} members.`,
                allowedMentions: { userS: [], roles: [] }
            });
        } catch (e) {
            console.log(e);
        }
    }
};