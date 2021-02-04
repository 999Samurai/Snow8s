module.exports = {
    name: "setup",
    aliases: [""],
    description: "Create a embed message to setup.",
    usage: `${process.env.PREFIX}setup`,
    run: (client, message, args, conn) => {

        if(!message.member.guild.me.hasPermission('ADMINISTRATOR')) return;

        const Discord = require('discord.js');
  
        let desc = '';
        desc += ':flag_gb: **Want to play 8s?** Click on the :raised_hand: emote below to search for a lobby.\n';
        desc += ':flag_pt: **Queres jogar 8s?** Clica no emote :raised_hand: abaixo para procurar um lobby.';
        desc += '\n\n**Matchmaking Stats:**\nPlayers in Queue: 0\nLobbys in Game: 0';

        const embed = new Discord.MessageEmbed()
        .setAuthor("Snow 8s")
        .setDescription(desc)
        .setFooter("This stats are updated every 30 seconds. | Created with 🖤 by 999Samurai")
  
        message.channel.send("@everyone", {embed}).then(sentEmbed => {
            sentEmbed.react("✋");
        })
    }
}
  