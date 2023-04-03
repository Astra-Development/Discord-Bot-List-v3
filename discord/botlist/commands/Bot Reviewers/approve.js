const roles = global.config.server.roles;

module.exports = {
  name: "approve",
  category: "Bot Reviewers",
  cooldown: 2,
  usage: "approve <bot>",
  description: "Approve a bot",
  run: async (client, message, args) => {
    let guild = client.guilds.cache.get(config.server.id);
    if (guild.members.cache.has(message.author.id)) {
      if (guild.members.cache.get(message.author.id).roles.cache.has(roles.botReviewer)) {
        var bot = message.mentions.users.first();

        if (bot) {
          var bot = bot;
        } else {
          var bot = args[0];
          var bot = client.users.cache.get(bot);
        }

        if (!bot) {
          return message.channel.send(":x: | You have given an invalid bot id or mention.");
        }

        const botdata = await botsdata.findOne({
          botID: bot.id
        });
        if (!botdata) {
          return message.channel.send(":x: | You have given an invalid bot id or mention.");
        }

        if (botdata.status === "Approved") {
          return message.channel.send("This bot is already approved.");
        }

        const guild1 = client.guilds.cache.get(config.server.id);
        if (!guild1.members.cache.has(botdata.botID)) {
          return message.channel.send(`Sorry but you can't approve a bot that isn't a member on the primary server.\nPlease, mention a user who has Admin permissions to invite.`);
        }

        guild1.members.cache.get(botdata.botID).roles.add(roles.verifiedBot);

        client.users.fetch(bot.id).then((bota) => {
          client.channels.cache.get(config.server.channels.botlogs).send(`<:db_verified:826375752840249365> | <@${bota.id}> by <@${botdata.ownerID}>${botdata.coowners?.length ? `, ${botdata.coowners.map(u => `<@${u}>`).join(', ')}` : ''}'s has been approved by <@${message.author.id}>.\n<${global.config.website.url}/bot/${bota.id}>`);
          if (client.users.cache.get(botdata.ownerID)) {
            client.users.cache.get(botdata.ownerID).send(`<:db_verified:826375752840249365> | Your bot named **${bota.tag}** has been approved! :tada:`);
            guild1.members.cache.get(botdata.ownerID).roles.add(roles.botDeveloper);
          }
          for (coowner of botdata.coowners) {
            if (client.users.cache.get(coowner)) {
              client.users.cache.get(coowner).send(`<:db_verified:826375752840249365> | Your bot named **${bota.tag}** has been approved! :tada:`);
              guild1.members.cache.get(coowner).roles.add(roles.botDeveloper);
            }
          }
        });

        await botsdata.findOneAndUpdate({
          botID: bot.id
        }, {
          $set: {
            status: "Approved"
          },
        });
        message.channel.send("Bot has been approved");
      }
    }
  },
};