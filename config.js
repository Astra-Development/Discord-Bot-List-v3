const port = 4777;

module.exports = {
    client: {
        id: '857185961280929813',
        token: '',
        secret: '',
        prefix: 'a!',
        owners: ["857177733398265876", "594638372996251655"],
    },

    serverClient: {
        id: '860206392652595281',
        prefix: 's!',
        token: '',
        invite: 'https://discord.com/oauth2/authorize?client_id=860206392652595281&scope=bot%20identify&permissions=19473'
    },

    database: {
        url: '', // Mongo url
    },

    website: {
        port: port,
        url: 'https://astrabots.xyz', // default url
        callback: 'https://astrabots.xyz/callback', // default callback url

        // testingURL: 'http://localhost:' + port, // default testing url
        // testingCallback: 'http://localhost:' + port + '/callback', // default testing callback url

        support: 'https://discord.gg/sQQFSnQhdt', // discord support server
        roles: {
            administrator: ["857177733398265876"]
        },
        botTags: [ // Botlist tags
            "Fun",
            "NSFW",
            "Game",
            "24/7",
            "OSU!",
            "Guard",
            "Anime",
            "Music",
            "Memes",
            "Invite",
            "Reddit",
            "Twitch",
            "Crypto",
            "Economy",
            "Logging",
            "Youtube",
            "Utility",
            "General",
            "Leveling",
            "Roleplay",
            "Fortnite",
            "Welcomer",
            "Chat bot",
            "Minecraft",
            "Community",
            "Minigames",
            "Moderation",
            "Protection",
            "Web Dashboard",
            "Reaction Roles",
            "Auto Moderation",
        ],
        serverTags: [
            "Fun",
            "Game",
            "NSFW",
            "Meme",
            "Shop",
            "Media",
            "Emoji",
            "Sound",
            "Stream",
            "Social",
            "Design",
            "Company",
            "Turkish",
            "Protest",
            "E-Sport",
            "Bot List",
            "Chatting",
            "Roleplay",
            "Challange",
            "Community",
            "Technology",
            "Server List",
            "Development",
        ]
    },

    server: {
        // Server ID
        id: '793149744847257600',

        // Channel IDs
        channels: {
            errors: '1023887120533823519', // Sends errors to this channel
            login: '850254765941325835', // Sends login logs to this channel (member login)
            botlogs: '850303116393185290', // Bot Add, Remove, Approve, Deny, Edit
            votes: '', // Bot votes channel
            serverlogs: '', // Server Add, Remove, Approve, Deny, Edit
            welcome: '804721971593478164', // welcome logs channel Member/Bot join & leave logs
            schedules: '1025000823790501949', // New schedule logs channel

            voiceChannelStatistics: '', // Voice channel statistics channel "Website Visitors: 1365"
        },

        // Role IDs
        roles: {
            botReviewer: '822476027824963584', // Bot reviewer role
            botDeveloper: '808682198101262378', // Bot developer role

            verifiedBot: '816650236733685784', // Verified bot role
            unverifiedBot: '816638129225596968', // Unverified bot role
        }
    },

    languages: [{
        flag: 'gr',
        code: 'el',
        name: 'Greek'
    }, {
        flag: 'gb',
        code: 'en',
        name: 'English'
    }, {
        flag: 'tr',
        code: 'tr',
        name: 'Türkçe'
    }, {
        flag: 'de',
        code: 'de',
        name: 'Deutsch'
    }, {
        flag: 'ru',
        code: 'ru',
        name: 'Russian'
    }, {
        flag: 'fr',
        code: 'fr',
        name: 'French'
    }, {
        flag: 'es',
        code: 'es',
        name: 'Spanish'
    }],
}