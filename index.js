//  Discord all events!

//  A quick and dirty fleshing out of the discord.js event listeners  (not tested at all!)
//     listed here -> https://discord.js.org/#/docs/main/stable/class/Client
//  Learn from this, do not just copy it mofo!

            /*      
                koad-was-here  
                b25lIEdvZCwgb25lIGxvdmUu          
                                            */

const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();

// const userManager = require("./user-manager.js");
// const serverManager = require("./server-manager.js");
// const channelManager = require("./channel-manager.js");
// const invitesManager = require("./invites-manager.js");
// const utilityManager = require("./utility-manager.js");
// const commandManager = require("./command-manager.js");

const homedir = require('os').homedir();
var datadir = process.env.DATADIR || homedir + '/.discord-example-bot/'

// Check and see if there is a banner in the datadir, if so -- show it.
try{
    var config = require(datadir+'/config.js');
}
catch(err) {
    console.log(`\n\n\nConfig file not found in ${datadir}, did you set the bot up right?\n\ntry again\n`);
    process.exit(1); // exit with error.
}

if (config.DEBUG && config.clearConsole) process.stdout.write('\033c');  // clear the console, useful
console.log(`loading testy using datadir: ${datadir}`)

// Check and see if there is a banner in the datadir, if so -- show it.
try{
    var banner = require(datadir+'/banner.js');
    console.log(banner);
}
catch(err) {
    console.log(`Support the Canada eCoin project -> canadaecoin.ca`)
}

// Success loading our config files, perfect.
// lets print that out if debug is set to true in our config file.
if(config.DEBUG) console.log(config);

// Use the built in utility functions in Discord to manage some in-memory type collections
// This is where we will load our command and utility scripts in from our data directoy.
// These collections are not persistant, and will need to be repopulated every time we start our bot.
client.commands = new Discord.Collection();
client.utilities = new Discord.Collection();

// we will also use this built in feature set to handle some session variables
client.session = new Discord.Collection();

// this is a placeholder for a logger that has been removed for this moment.
const log = (log) => { console.log(log); }

// Load the commands from files.
fs.readdir(datadir+'commands/', (err, files) => {
    if(err) {
        console.log(`\n\n\nNo commands directory found at "${datadir}commands/", did you set the bot up right?\n\ntry again, you need at least 1 command to continue.\n`);
        process.exit(1); // exit with error.
    }

    let jsfile = files.filter(f=> f.split(".").pop() === "js")

    if(jsfile.length <= 0){
        console.log(`\n\n\nNo commands found in "${datadir}commands/", did you set the bot up right?\n\ntry again, you need at least 1 command to continue.\n`);
        return;
    }

    jsfile.forEach((file, i) => {
        let props = require(`${datadir}commands/${file}`)
        if(config.DEBUG) console.log(`${datadir}commands/${file} is loaded`);
        client.commands.set(props.meta.name, props);
        totalCommands++;
    });

    log(`Total commands loaded: ${totalCommands}`);
});
