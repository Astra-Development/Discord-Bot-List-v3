module.exports = {
    name: 'ready',
    run: async (serverClient) => {
        try {
            console.success(`[Discord Server List] Logged in as ${serverClient.user.tag}`.brightYellow);

            setInterval(async () => {
                let servers = await serversdata.find() || [];
                serverClient.user.setPresence({
                    activities: [
                        { name: `${servers.length ? servers.length : 0} servers! | @mention me for help` }
                    ],
                    // status: 'idle'
                });
            }, 60000 * 10); // 10 minutes
        } catch (e) {
            console.log(e);
        }
    }
}
