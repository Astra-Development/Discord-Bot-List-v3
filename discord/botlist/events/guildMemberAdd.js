module.exports = {
    name: 'guildMemberAdd',
    run: async (client, member) => {
        try {
            if (member.guild.id !== global.config.server.id) return;
            const welcomeChannel = global.config.server.channels.welcome;

            let embed = {};
            embed.color = 0x2F3136;
            embed.description = `
Welcome ${member}! We're so glad you've decided to join our Discord server.

Our community is dedicated to providing a place for people to advertise their Discord bots and servers for free on our website, https://astrabots.xyz, as well as chat with others and make new connections on our server. Whether you're looking to promote your own project or just want to meet new people, we have something for everyone.

We strive to create a friendly and welcoming environment for all members, so don't be shy! If you have any questions about the server or the website, please don't hesitate to ask. Our team is always happy to help.

We look forward to getting to know you and seeing you around the server. Thank you for choosing to join us, and we hope you have a great time here.`;
            embed.image = {
                url: "https://media.discordapp.net/attachments/846824301676068874/1058371352953888778/WLHvlkTcRghQi2jNCiYy2zOlR3sGcmfe1.jpg"
            };

            global.client.channels.cache.get(welcomeChannel).send({
                content: embed.description,
                files: [
                    {
                        attachment: "https://media.discordapp.net/attachments/846824301676068874/1058371352953888778/WLHvlkTcRghQi2jNCiYy2zOlR3sGcmfe1.jpg",
                        name: "image1.jpg"
                    }, {
                        attachment: "https://cdn.discordapp.com/attachments/846824301676068874/1058375725847171082/LRZT9Bp.gif",
                        name: "image2.jpg"
                    }
                ]
            });



        } catch (e) {
            console.log(e);
        }
    }
};