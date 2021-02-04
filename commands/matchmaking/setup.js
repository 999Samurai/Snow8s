module.exports = {
    name: "setup",
    aliases: [""],
    description: "Create a embed message to setup.",
    usage: `${process.env.PREFIX}setup`,
    run: (client, message, args, conn) => {

        if(!message.member.guild.me.hasPermission('ADMINISTRATOR')) return;

        const Discord = require('discord.js');
  
        let desc = '';
        desc += '\n:flag_gb: **Want to play 8s?** Click on the :raised_hand: emote below to search for a lobby.\n';
        desc += ':flag_pt: **Queres jogar 8s?** Clica no emote :raised_hand: abaixo para procurar um lobby.';

        const embed = new Discord.MessageEmbed()
        .setAuthor("Snow 8s")
        .setDescription(desc)
        .setFooter("Created with 🖤 by 999Samurai")
  
        message.channel.send("@everyone", {embed}).then(sentEmbed => {
            sentEmbed.react("✋");
        })
    }
}
  