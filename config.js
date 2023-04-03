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
        port: 4777,
        url: 'https://astrabots.xyz', // default url
        callback: 'https://astrabots.xyz/callback', // default callback url
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
        id: '793149744847257600',
        channels: {
            errors: '1023887120533823519',
            login: '850254765941325835',
            botlogs: '850303116393185290', // Bot Add, Remove, Approve, Deny, Edit
            votes: '',
            serverlogs: '',
            welcome: '804721971593478164', // welcome logs channel Member/Bot join & leave logs
            schedules: '1025000823790501949', // New schedule logs channel
        },
        roles: {
            botReviewer: '822476027824963584',

            botDeveloper: '808682198101262378',

            verifiedBot: '816650236733685784',
            unverifiedBot: '816638129225596968',
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