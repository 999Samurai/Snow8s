const { Client, Collection } = require('discord.js');
const Discord = require('discord.js');
const mysql = require("mysql");
require('dotenv').config({ allowEmptyValues: true })
const client = new Client({ disableEveryone: true });

client.commands = new Collection();
client.aliases = new Collection();

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

// Objects
const UserObject = require("./objects/user.js");

// Classes
const User = new UserObject(conn);

// Handler
["discord"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

const prefix = process.env.PREFIX;

client.on('ready', async () => {
    // When bot starts if database doens't has any table, this error will happen.
    await User.resetQueue().catch((e) => {
        console.error({
            message: 'Are you sure you created the database tables ?',
            error: e
        })
    });
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(function(){ updateMatchmakingStats(); }, 30000);
});

client.on('message', async (message) => {

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);
  
    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g);
    const cmd = args.shift().toLowerCase();
  
    if (cmd.length === 0) return;
  
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
  
    if (command) command.run(client, message, args, User);
});

client.on('raw', (data) => {

    if (data.t !== "MESSAGE_REACTION_ADD") return;
    if (data.d.user_id == client.user.id) return;

    let command = client.commands.get(data.t);
    if (command) command.run(client, data, User);
})

function updateMatchmakingStats() {

    try {

        const channelMatchmakingStats = client.channels.cache.find(channel => channel.name === process.env.SETUP_CHANNEL_NAME);
        channelMatchmakingStats.messages.fetch({ limit: 1 }).then(async (messages) => {

            let setupMessage = messages.first();

            let queueCount = await User.getQueueCount();
            let lobbyCount = await User.getLobbyCount();

            let desc = '';
            desc += ':flag_gb: **Want to play 8s?** Click on the :raised_hand: emote below to search for a lobby.\n';
            desc += ':flag_pt: **Queres jogar 8s?** Clica no emote :raised_hand: abaixo para procurar um lobby.';
            desc += '\n\n**Matchmaking Stats:**\nPlayers in Queue: ' + queueCount + '\nLobbys in Game: ' + lobbyCount;

            const embed = new Discord.MessageEmbed()
            .setAuthor("Snow 8s")
            .setDescription(desc)
            .setFooter("This stats are updated every 30 seconds. | Created with 🖤 by 999Samurai")

            setupMessage.edit("@everyone", {embed});

        });

    } catch {

        console.error({
            message: 'The message of the channel is from the bot? It needs to be.',
            error: "Error while trying to edit the setup message and update matchmaking stats."
        })

    }
}

client.login(process.env.TOKEN);