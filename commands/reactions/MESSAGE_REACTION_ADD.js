module.exports = {
    name: "MESSAGE_REACTION_ADD",
    aliases: [""],
    description: "",
    usage: "",
    run: async (client, data, User) => {

        const Discord = require('discord.js');
        const pm = require('pretty-ms');

        let user_id = data.d.user_id;

        let channel = await client.channels.fetch(data.d.channel_id);
        let message = await channel.messages.fetch(data.d.message_id);

        if(data.d.emoji.name == "✋") {

            // Queuing
            if(message.author.id == client.user.id && message.channel.name == process.env.SETUP_CHANNEL_NAME) {

                message.reactions.resolve("✋").users.remove(user_id);

                let checkRegister = await User.checkRegister(user_id);
                if(!checkRegister) {
                    await User.register(user_id);
                }

                let userInQueue = await User.checkIfQueue(user_id);
                let userInGame = await User.checkIfInGame(user_id);

                if(userInGame || userInQueue) {

                    const embed = new Discord.MessageEmbed()
                    .setAuthor("Snow 8s")
                    .setColor("#0462B2")
                    .setDescription("You are already in queue or in a lobby.\nIf you think you are facing a bug message Samurai.")
                    .setFooter("Created with 🖤 by 999Samurai")

                    await client.users.cache.get(user_id).send(embed).then(msg => { msg.delete({ timeout: 20000 }) });
                    return;
                }

                let userToQueue = await User.addToQueue(user_id);
                
                if(userToQueue) {

                    const embed = new Discord.MessageEmbed()
                    .setAuthor("Snow 8s")
                    .setColor("#0462B2")
                    .setDescription("You have been added to the queue successfully.")
                    .setFooter("Created with 🖤 by 999Samurai")

                    await client.users.cache.get(user_id).send(embed).then(message => message.react("❌"));

                } else {

                    const embed = new Discord.MessageEmbed()
                    .setAuthor("Snow 8s")
                    .setColor("#FF0000")
                    .setDescription("An error occurred while trying to put you in the queue, maybe send message to 999Samurai.")
                    .setFooter("Created with 🖤 by 999Samurai")

                    await client.users.cache.get(user_id).send(embed);
                    
                    return;
                }

                let usersInQueue = await User.checkQueueList();
                if(usersInQueue >= 8) {
                    let usersArray = await User.getQueueList();
                    let lobbyId = await User.createLobby();
                    await User.addPlayersToLobby(usersArray, lobbyId);

                    const embed = new Discord.MessageEmbed()
                    .setAuthor("Snow 8s")
                    .setColor("#03A40D")
                    .setDescription("**Match Found!** __**You have 30 seconds to accept the match!**__\nReact with ✅ to accept the match.")
                    .setFooter("Created with 🖤 by 999Samurai")

                    usersArray.forEach(async function(user) {
                        await User.removeFromQueue(user.user_id);
                        client.users.cache.get(user.user_id).send(embed).then(async (message) => {
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
                                await User.setPlayerReady(user.user_id);

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
                                await User.playerDodge(user.user_id, lobbyId);

                            });
                        });
                    });

                    setTimeout(function() { startMatch(lobbyId) }, 35000);

                }
            }
        }

        if(data.d.emoji.name == "❌") {

            if (message.author.id == client.user.id && message.channel.name == "lobby") {

                let countReactions = message.reactions.cache.filter(rx => rx.emoji.name == "❌");
                let categoryChannel = await client.channels.fetch(channel.parentID);
                let lobbyId = (categoryChannel.name).split('-')[1];
                let playersArray = await User.getLobbyPlayers(lobbyId);

                if(countReactions.first().count >= ((playersArray.length / 2) + 2)) {

                    await User.deleteLobby(lobbyId);
                    categoryChannel.children.forEach(channel => channel.delete());
                    categoryChannel.delete();

                }
            }

            if(message.author.id == client.user.id && message.channel.type === 'dm') {

                await message.delete();
                await User.removeFromQueue(user_id);

                const firstEmbed = new Discord.MessageEmbed()
                .setAuthor("Snow 8s")
                .setColor("#FFFFFF")
                .setDescription("You have been removed from queue.")
                .setFooter("Created with 🖤 by 999Samurai");

                await client.users.cache.get(user_id).send(firstEmbed).then(msg => { msg.delete({ timeout: 20000 }) });
                
            }
        }

        if(data.d.emoji.name == "🔄") {

            if (message.author.id == client.user.id && message.channel.name == "lobby") {

                let countReactions = message.reactions.cache.filter(rx => rx.emoji.name == "🔄");
                let categoryChannel = await client.channels.fetch(channel.parentID);
                let lobbyId = (categoryChannel.name).split('-')[1];
                let playersArray = await User.getLobbyPlayers(lobbyId);

                if(countReactions.first().count >= ((playersArray.length / 2) + 2)) {

                    const messages = await channel.messages.fetch({limit: 100});
                    messages.forEach(msg => { msg.delete(); });

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
    
                    await channel.send(firstEmbed);
    
                    const secondEmbed = new Discord.MessageEmbed()
                    .setColor("#FFFFFF")
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setDescription("**Rules**\n**First to Five Ping Pong.**\n\nDefault Shotgun: __**Lever Pump**__\nIf all the players want **pump** or **charge** then you can go with pump.\n\n**Map**\n🗺️ 8585-0663-5258")
                    .setFooter("Created with 🖤 by 999Samurai");
    
                    await channel.send(secondEmbed);
    
                    const thirdEmbed = new Discord.MessageEmbed()
                    .setColor("#FFFFFF")
                    .setAuthor(client.user.username, client.user.avatarURL)
                    .setDescription("**Vote Options:**\n\n🔄 - Restart the lobby with random teams. (" + ((teams.length / 2) + 2) + " votes)\n❌ - End this lobby. (" + ((teams.length / 2) + 2) + " votes)")
                    .setFooter("Created with 🖤 by 999Samurai");
    
                    await channel.send(thirdEmbed).then(async (message) => {
                        await message.react("🔄");
                        await message.react("❌");
                    });

                }

            }
        }

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

            let guild = await client.guilds.fetch(data.d.guild_id);
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
