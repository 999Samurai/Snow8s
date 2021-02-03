const { readdirSync } = require("fs");

const ascii = require("ascii-table");

let table = new ascii("Snow 8s");
table.setHeading("Commands", "Status Load");

module.exports = (client) => {

    readdirSync("./commands/").forEach(dir => {
        const cmd = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith(".js"));
    
        for (let file of cmd) {
            let pull = require(`../commands/${dir}/${file}`);
    
            if (pull.name) {
                client.commands.set(pull.name, pull);
                table.addRow(file, `Sucess`);
            } else {
                table.addRow(file, `Error`);
                continue;
            }
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        }
    });
    
    console.log(table.toString());
}