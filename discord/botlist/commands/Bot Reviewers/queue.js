module.exports = {
  name: "queue",
  category: "Bot Reviewers",
  cooldown: 2,
  usage: "queue",
  description: "Get botlist's queue list",
  run: async (client, message) => {
    try {
      let guild = client.guilds.cache.get(config.server.id)
      if (guild.members.cache.has(message.author.id)) {
        if (guild.members.cache.get(message.author.id).roles.cache.has(global.config.server.roles.botReviewer)) {
          let msg = await message.channel.send("This may take a while...");
          const b = await botsdata.find();
          const bot = await b.filter(p => p.status == 'unverified')
          if (bot.length === 0) return msg.edit('It seems like nobody applied a new bot!');

          const bots2 = []
          for (let i = 0; i < bot.length; i++) {
            await bots2.push(`- ${bot[i].username} - ${bot[i].botID} **[ [Invite to Test](https://discord.com/oauth2/authorize?client_id=${bot[i].botID}&scope=bot&guild_id=850984962650931201&permissions=0) ]**`);
          }
          const embed = {};
          embed.title = "Botlist's Queue List";
          embed.description = bots2.join('\n');
          embed.color = 0x7289DA;
          embed.setTimestamp = true;
          msg.edit({
            content: null,
            embeds: [embed]
          })
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}