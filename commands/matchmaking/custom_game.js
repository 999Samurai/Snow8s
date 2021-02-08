module.exports = {
    name: "custom",
    aliases: [""],
    description: "Create a custom game with specific players.",
    usage: `${process.env.PREFIX}custom @player1 @player2 @player3 @player4 @player5 @player6 @player7`,
    run: async (client, message, args, User) => {

        const Discord = require('discord.js');
        const pm = require('pretty-ms');
        
        // Need to be pair. Mention members + 1 (message author).
        if((message.mentions.members.size + 1) % 2 != 0 || message.mentions.members.size == 0) {

            const embed = new Discord.MessageEmbed()
            .setAuthor("Snow 8s")
            .setColor("#03A40D")
            .setDescription("You need to mention a pair number of players.\n\nExample: ```!custom @player1```You vs Player1")
            .setFooter("Created with 🖤 by 999Samurai")

            message.channel.send(embed);

            return;
        }

        let players = message.mentions.users.array();
        players.push(message.author);

        let lobbyId = await User.createLobby();
        await User.addPlayersToCustomLobby(players, lobbyId);

        const embed = new Discord.MessageEmbed()
        .setAuthor("Snow 8s")
        .setColor("#03A40D")
        .setDescription("**You have been invited for a custom game!\n** __**You have 30 seconds to accept the match!**__\n\nReact with ✅ to accept the match.")
        .setFooter("Created with 🖤 by 999Samurai")
        
        players.forEach(async function(player) {

            client.users.cache.get(player.id).send(embed).then(async (message) => {
                await message.react("✅");

                const collector = message.createReactionCollector((args, user) => 
                { return "✅".includes(args._emoji.name) && !user.bot }, { time: 30000, max: 1 });

                collector.on('collect', async () => {

                    await message.delete();

                    const embed = new Discord.MessageEmbed()
                    .setAuthor("Snow 8s")
                    .setColor("#03A40D")
                    .setDescription("**Match Accepted!\n** __**Waiting until all the players accept the match or for the time expires.**__")
                    .setFooter("Created with 🖤 by 999Samurai")

                    message.reply(embed);
                    await User.setPlayerReady(player.id);

                });

                collector.on('end', async (_collected, reason) => {
                    
                    if(reason != "time") return;

                    await message.delete();

                    const embed = new Discord.MessageEmbed()
                    .setAuthor("Snow 8s")
                    .setColor("#FF0000")
                    .setDescription("**You failed to accept the match!**")
                    .setFooter("Created with 🖤 by 999Samurai")

                    message.reply(embed);
                    await User.playerDodge(player.id, lobbyId);

                });
            });
        });

        setTimeout(function() { startMatch(lobbyId) }, 35000);

        async function startMatch(lobbyId) {

            let dodge = await User.checkDodge(lobbyId);
            let playersArray = await User.getLobbyPlayers(lobbyId);

            if(dodge) {

                playersArray.forEach(player => {

                    if(player.is_ready == 0) return;

                    const embed = new Discord.MessageEmbed()
                    .setAuthor("Snow 8s")
                    .setColor("#FF0000")
                    .setDescription("**Match Cancelled!\n**Someone didn't accepted the match.")
                    .setFooter("Created with 🖤 by 999Samurai")

                    client.users.cache.get(player.user_id).send(embed);
                });

                await User.deleteLobby(lobbyId);
                return;
            }

            let guild = await client.guilds.fetch(message.guild.id);
            let channelName = "Lobby-" + lobbyId;

            var i;
            var userPermissions = [];
            
            for(i = 0; i < playersArray.length; i++) {
                
                userPermissions.push({ "id": playersArray[i].user_id, "allow": ["VIEW_CHANNEL"]});

            }

            userPermissions.push({id: guild.id, deny: ['VIEW_CHANNEL']});
            userPermissions.push({ id: "806266531859398736",  allow: [ "VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY" ]});

            guild.channels.create(channelName, {
                type: 'category',
                position: 1,
                permissionOverwrites: userPermissions
            }).then(async (category) => {
                let lobbyChannel = await guild.channels.create("lobby", {
                    type: 'text',
                    parent: category,
                    permissionOverwrites: userPermissions
                });

                await guild.channels.create("Team 1", {
                    type: 'voice',
                    parent: category,
                    permissionOverwrites: userPermissions
                });

                await guild.channels.create("Team 2", {
                    type: 'voice',
                    parent: category,
                    permissionOverwrites: userPermissions
                });

                playersArray.forEach(player => {

                    const embed = new Discord.MessageEmbed()
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setColor("#FFFFFF")
                    .setDescription("**Lobby has been created successfully**\nYou can see your lobby here: <#" + lobbyChannel + ">!")
                    .setFooter("Created with 🖤 by 999Samurai")

                    client.users.cache.get(player.user_id).send(embed);
                });

                let teams = shuffle(playersArray);
                let desc = "Welcome to 8s Portugal, the portuguese 8s discord based system.\n**Randomly generated teams:**\n\n**Team 1:**\n";

                var i;
                for(i = 0; i < teams.length; i++) {

                    let userInfo = await client.users.fetch(teams[i].user_id);
                    let now = Date.now();
                    let createdAt = userInfo.createdAt;
                    let age = now - createdAt;

                    if(i < teams.length / 2) {
                        desc += "Player " + (i + 1) + ": <@" + teams[i].user_id + "> (Account Age: " + pm(age, {verbose: true}) + ")\n";
                    } else {
                        if(i == teams.length / 2) desc += "\n**Team 2:**\n";
                        desc += "Player " + (i + 1) + ": <@" + teams[i].user_id + "> (Account Age: " + pm(age, {verbose: true}) + ")\n";
                    }
                }

                const firstEmbed = new Discord.MessageEmbed()
                .setAuthor("Snow 8s")
                .setColor("#FFFFFF")
                .setDescription(desc)
                .setFooter("Created with 🖤 by 999Samurai");

                await lobbyChannel.send(firstEmbed);

                const secondEmbed = new Discord.MessageEmbed()
                .setColor("#FFFFFF")
                .setAuthor(client.user.username, client.user.avatarURL)
                .setDescription("**Rules**\n**First to Five Ping Pong.**\n\nDefault Shotgun: __**Lever Pump**__\nIf all the players want **pump** or **charge** then you can go with pump.\n\n**Map**\n🗺️ 8585-0663-5258")
                .setFooter("Created with 🖤 by 999Samurai");

                await lobbyChannel.send(secondEmbed);

                const thirdEmbed = new Discord.MessageEmbed()
                .setColor("#FFFFFF")
                .setAuthor(client.user.username, client.user.avatarURL)
                .setDescription("**Vote Options:**\n\n🔄 - Restart the lobby with random teams. (" + ((teams.length / 2) + 2) + " votes)\n❌ - End this lobby. (" + ((teams.length / 2) + 2) + " votes)")
                .setFooter("Created with 🖤 by 999Samurai");

                await lobbyChannel.send(thirdEmbed).then(async (message) => {
                    await message.react("🔄");
                    await message.react("❌");
                });
            })
        }

        function shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
          
            while (0 !== currentIndex) {
          
              randomIndex = Math.floor(Math.random() * currentIndex);
              currentIndex -= 1;
          
              temporaryValue = array[currentIndex];
              array[currentIndex] = array[randomIndex];
              array[randomIndex] = temporaryValue;
            }
          
            return array;
        }

    }
}
  
