const { Client, GatewayIntentBits } = require('discord.js');

const config = require('./config.js');
global.config = config;

const client = (global.client = new Client({
    fetchAllMembers: true,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ]
}));

const fs = require('fs');
client.commands = new Map();
client.aliases = new Map();
client.categories = fs.readdirSync('./discord/botlist/commands/');
client.cooldowns = new Map();
client.slashCommands = new Map();
client.md = require('markdown-it')({
    html: true, // Enable HTML tags in source
    linkify: true, // autoconvert links
    typographer: true, // Enable some language-neutral replacement + quotes beautification
    xhtmlOut: true, // this is for discord
    breaks: true, // convert '\n' in paragraphs into <br>
    langPrefix: 'language-',
    quotes: '“”‘’', // “”‘’,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str, true).value;
            } catch (__) { }
        }
        return ''; // use external default escaping
    }
});

['eventHandler', 'commandHandler', 'slashHandler'].map(handler => {
    require(`./discord/botlist/handlers/${handler}`)(client);
});

client.on("ready", async () => {
    client.channels.cache.get('1030503213125873748')?.setName("Website Visitors: "  + Object.values((await siteanalytics.find())[0].country[0]).reduce((c, d) => c + d, 0) ?? 0);
    setInterval(async () => {
        client.channels.cache.get('1030503213125873748')?.setName("Website Visitors: "  + Object.values((await siteanalytics.find())[0].country[0]).reduce((c, d) => c + d, 0) ?? 0);
    }, 60000 * 5);
});

client.login(global.config.client.token).catch(() => {
    console.error('Invalid token.');
});

const serverClient = (global.serverClient = new Client({
    fetchAllMembers: true,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
    ]
}));

serverClient.commands = new Map();
serverClient.aliases = new Map();
serverClient.categories = fs.readdirSync('./discord/serverlist/commands/');
serverClient.cooldowns = new Map();
serverClient.slashCommands = new Map();

['eventHandler', 'commandHandler', 'slashHandler'].forEach(handler => {
    require(`./discord/serverlist/handlers/${handler}`)(serverClient);
});
serverClient.login(global.config.serverClient.token).catch(() => {
    console.error('Invalid token.');
});

// Calling Server
require('./index.js')(client);
require('./database/connect.js')(client);