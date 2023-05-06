module.exports = {
    // Client will be the bot that you will use for the main purpose of the website and commands.
    client: {
        id: '857185961280929813', // Bot ID
        token: '', // Bot token
        secret: '', // Bot secret
        prefix: 'a!', // Bot prefix
        owners: ["857177733398265876", "594638372996251655"], // Bot owner(s) ID, can be multiple owners separated by comma 
    },

    // ServerClient will be the bot that will be used for the server list/server commands 
    // and the bot that will be public to everyone so they can invite it to their server.
    serverClient: {
        id: '860206392652595281', // Server Bot ID
        prefix: 's!', // Server Bot prefix
        token: '', // Server Bot token

        // Replace the REPLACEME with your client ID
        invite: 'https://discord.com/oauth2/authorize?client_id=REPLACEME&scope=bot%20identify&permissions=19473'
    },

    database: {
        url: '', // Mongo url (eg. mongodb+srv://<username>:<password>@<host>/<database>)
    },

    website: {
        port: 4777, // The port that the website will be on (default: 4777)
        // Localhost Example:
        // url: 'http://localhost:4777', // default url
        // callback: 'http://localhost:4777/callback', // default callback url

        // Example with domain:
        url: 'https://astrabots.xyz', // default url
        callback: 'https://astrabots.xyz/callback', // default callback url

        // For login issues about the callback url, please join the support server and check the #support channel pinned messages.
        // If you still can't fix it, feel free to open a ticket in the support server.

        support: 'https://discord.gg/sQQFSnQhdt', // discord support server
        roles: {
            administrator: ["857177733398265876"] // administrator role id(s)
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
        id: '793149744847257600', // Server ID

        emojis: {
            "approve": "<:db_verified:826375752840249365>", 
            "decline": "<:db_delete:816717275431174144>",
            "success": "✅",
            "error": "❌",
        },

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