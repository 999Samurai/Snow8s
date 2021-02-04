const { Client, Collection } = require('discord.js');
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
    })
    console.log(`Logged in as ${client.user.tag}!`);
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
  
    if (command) command.run(client, message, args, conn);
});

client.on('raw', (data) => {

    if (data.t !== "MESSAGE_REACTION_ADD") return;
    if (data.d.user_id == client.user.id) return;

    let command = client.commands.get(data.t);
    if (command) command.run(client, data, User);
})

client.login(process.env.TOKEN);