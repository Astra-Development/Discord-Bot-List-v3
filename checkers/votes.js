(async () => {
    const botVotes = await global.botVotes.find();
    const serverVotes = await global.serverVotes.find();

    for (const voted of botVotes) {
        let timeLeft = 10800000 - (Date.now() - voted.Date);
        if (timeLeft > 0) {
            setTimeout(async () => {
                await global.botVotes.deleteOne({ userID: voted.userID, botID: voted.botID });
            }, timeLeft);
        } else {
            await global.botVotes.deleteOne({ userID: voted.userID, botID: voted.botID });
        }

        for (const voted of serverVotes) {
            let timeLeft = 10800000 - (Date.now() - voted.Date);
            if (timeLeft > 0) {
                setTimeout(async () => {
                    await global.serverVotes.deleteOne({ userID: voted.userID, serverID: voted.serverID });
                }, timeLeft);
            } else {
                await global.serverVotes.deleteOne({ userID: voted.userID, serverID: voted.serverID });
            }
        }
    }
})();