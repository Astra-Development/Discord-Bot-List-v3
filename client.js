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

const connectToDatabase = async () => {
    await require('./database/connect.js')(client);
};

const clientReady = new Promise(resolve => {
    client.on("ready", async () => {
        await require('./index.js')(client);
        await connectToDatabase();
        resolve();
    });
});

const startSClient = async () => {
    await clientReady;

    try {
        let voiceChannel = client.channels.cache.get(config.server.voiceChannelStatistics)


        const data = await siteanalytics.find();
        const countryData = data[0] && data[0].country && data[0].country[0];
        const count = countryData ? Object.values(countryData).reduce((c, d) => c + d, 0) : 0;


        if (voiceChannel) {
            client.channels.cache.get(voiceChannel).setName("Website Visitors: " + count)
            setInterval(async () => {
                client.channels.cache.get(voiceChannel).setName("Website Visitors: " + count)
            }, 60000 * 5);
        }
    } catch (e) {
        console.log(e)
    }
};

startSClient();

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