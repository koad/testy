//  Discord all events!

//  A quick and dirty fleshing out of the discord.js event listeners  (not tested at all!)
//     listed here -> https://discord.js.org/#/docs/main/stable/class/Client
//  Learn from this, do not just copy it mofo!

            /*      
                koad-was-here  
                b25lIEdvZCwgb25lIGxvdmUu          
                                            */

// This repo could be used as a module for indie.express and is compatible with the `Social Tools` drop-in

const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs');
const homedir = require('os').homedir();
var datadir = process.env.DATADIR || homedir + '/.discord-example-bot/'

// Check and see if there is a config file in the datadir
try{
    var config = require(datadir+'/config.js');
}
catch(err) {
    console.log(`\n\n\nConfig file not found in ${datadir}, did you set the bot up right?\n\ntry again\n`);
    process.exit(1); // exit with error.
}

if (config.clearConsole) process.stdout.write('\033c');  // clear the console, useful
console.log(`loading testy using datadir: ${datadir}`);

// Check and see if there is a banner in the datadir, if so -- show it.
fs.readFile(datadir+'banner', function (err, data) {
    if (err) {
        console.log(`Support the Canada eCoin project -> canadaecoin.ca`);
    } else {
        console.log(`\n\x1b[1m${data.toString()}\x1b[0m\n`);
    }
});

// Success loading our config files, perfect.
// lets print that out if debug is set to true in our config file.
if(config.DEBUG) console.log(config);

// Use the built in utility functions in Discord to manage some in-memory type collections
// This is where we will load our command and utility scripts in from our data directory.
// These collections are not persistent, and will need to be repopulated every time we start our bot.
client.commands = new Discord.Collection();
client.utilities = new Discord.Collection();

// we will also use this built in feature set to handle some session variables
client.session = new Discord.Collection();

// this is a placeholder for a logger that has been removed for this moment.
const log = (log) => { console.log(log); }

// Load the commands from files.
var totalCommands = 0;
fs.readdir(datadir+'commands/', (err, files) => {
    if(err) {
        console.log(`\n\n\nNo commands directory found at "${datadir}commands/", did you set the bot up right?\n\ntry again, you need at least 1 command to continue.\n`);
        process.exit(1); // exit with error.
    }

    let jsfile = files.filter(f=> f.split(".").pop() === "js")

    if(jsfile.length <= 0){
        console.log(`\n\n\nNo commands found in "${datadir}commands/", did you set the bot up right?\n\ntry again, you need at least 1 command to continue.\n`);
        process.exit(1); // exit with error.
    }

    jsfile.forEach((file, i) => {
        let props = require(`${datadir}commands/${file}`)
        if(config.DEBUG) console.log(`${datadir}commands/${file} is loaded`);
        client.commands.set(props.meta.name, props);
        totalCommands++;
    });

    log(`Total commands loaded: ${totalCommands}`);
});

// Load the utilities from files.
var totalUtilities = 0;
fs.readdir(datadir+'utilities/', (err, files) => {
    if(err) {
        console.log(`\n\n\nNo utilities directory found at "${datadir}utilities/", did you set the bot up right?\n\ntry again, you need at least 1 utility to continue.\n`);
        process.exit(1); // exit with error.
    }

    let jsfile = files.filter(f=> f.split(".").pop() === "js")

    if(jsfile.length <= 0){
        console.log(`\n\n\nNo utilities found in "${datadir}utilities/", did you set the bot up right?\n\ntry again, you need at least 1 utility to continue.\n`);
        process.exit(1); // exit with error.
    }

    jsfile.forEach((file, i) => {
        let props = require(`${datadir}utilities/${file}`)
        if(config.DEBUG) console.log(`${datadir}utilities/${file} is loaded`);
        client.utilities.set(props.meta.name, props);
        totalUtilities++;
    });

    log(`Total commands loaded: ${totalUtilities}`);
});

// Load the manager scripts (optional)
// const userManager = require("./user-manager.js");
// const serverManager = require("./server-manager.js");
// const channelManager = require("./channel-manager.js");
// const invitesManager = require("./invites-manager.js");
// const utilityManager = require("./utility-manager.js");
// const commandManager = require("./command-manager.js");

var inviteLink = ""; // Will get this when the bot becomes ready...

// Lets run a loop for whatever reason, you decide.
setInterval(function(){ 
    console.log(`Guilds (${client.guilds.size}): ${client.guilds.map(g => g.name).join(", ")}`);
}, 100000);

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// Everything below this line is listening for certain events from Discord and acting upon those events.
// below this line is where you will do most/all of the coding of actions and such in this bot.
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// The few commands that this bot uses out of the box up top -- then the rest in alphabetical order
// for you to do your magic with.  Look at the top few events for inspiration and guidance
//
// ready
/* Emitted when the client becomes ready to start working.    */
client.on("ready", function(){
    console.log(`I am ready! Logged in as ${client.user.tag}!`);
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 

    client.user.setStatus(config.initalStatus, 'Made by koad');
    client.user.setActivity(config.initalActivity);
    client.generateInvite(config.permissions)
    .then(link => {
        console.log(`Generated bot invite link\n\n\x1b[1m${link}\x1b[0m\n`);
        inviteLink = link;
    });
});

// message
/* Emitted whenever a message is created.
PARAMETER      TYPE           DESCRIPTION
message        Message        The created message    */
client.on("message", function(message){
    if (config.clearConsole) process.stdout.write('\033c');  // clear the console, useful
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    if(config.DEBUG) console.log(`message is created -> ${args}`);

    // TODO -- If this is a DM and no prefix was used, then add it to the message now and proceed as normal.
    if(message.channel.type == "dm" && cmd.charAt(0) != config.prefix) {
        cmd = config.prefix + cmd;
    };

    // We only really want users to interact with the bot, so lets verify that now.  This 
    // shouldnt really need to be done, buts lets be paranoid here about things.
    client.fetchUser(message.author.id)
    .then((user) => {
        // If there is a command in our collection with the matching name as our first argument, then load it.
        let command = client.commands.get(cmd.slice(config.prefix.length));
        //  If a command in the previous step gets loaded into our variable, then lets run it!
        if (command) command.run(client, message, args, config);
    })
    .catch((err) => {
        console.error('message has no user', err);
    });
});

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// the rest of'm
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// channelCreate
/* Emitted whenever a channel is created.
PARAMETER    TYPE        DESCRIPTION
channel      Channel     The channel that was created    */
client.on("channelCreate", function(channel){
    if(config.DEBUG) console.log(`channelCreate: ${channel}`);
});

// channelDelete
/* Emitted whenever a channel is deleted.
PARAMETER   TYPE      DESCRIPTION
channel     Channel   The channel that was deleted    */
client.on("channelDelete", function(channel){
    if(config.DEBUG) console.log(`channelDelete: ${channel}`);
});

// channelPinsUpdate
/* Emitted whenever the pins of a channel are updated. Due to the nature of the WebSocket event, not much information can be provided easily here - you need to manually check the pins yourself.
PARAMETER    TYPE         DESCRIPTION
channel      Channel      The channel that the pins update occurred in
time         Date         The time of the pins update    */
client.on("channelPinsUpdate", function(channel, time){
    if(config.DEBUG) console.log(`channelPinsUpdate: ${channel}:${time}`);
});
    
// channelUpdate
/* Emitted whenever a channel is updated - e.g. name change, topic change.
PARAMETER        TYPE        DESCRIPTION
oldChannel       Channel     The channel before the update
newChannel       Channel     The channel after the update    */
client.on("channelUpdate", function(oldChannel, newChannel){
    if(config.DEBUG) console.log(`channelUpdate -> a channel is updated - e.g. name change, topic change`);
});

// clientUserGuildSettingsUpdate
/* Emitted whenever the client user's settings update.
PARAMETER                  TYPE                       DESCRIPTION
clientUserGuildSettings    ClientUserGuildSettings    The new client user guild settings    */
client.on("clientUserGuildSettingsUpdate", function(clientUserGuildSettings){
    if(config.DEBUG) console.log(`clientUserGuildSettingsUpdate -> client user's settings update`);
});

// clientUserSettingsUpdate
/* Emitted when the client user's settings update.
PARAMETER             TYPE                  DESCRIPTION
clientUserSettings    ClientUserSettings    The new client user settings    */
client.on("clientUserSettingsUpdate", function(clientUserSettings){
    if(config.DEBUG) console.log(`clientUserSettingsUpdate -> client user's settings update`);
});

// debug
/* Emitted for general debugging information.
PARAMETER    TYPE         DESCRIPTION
info         string       The debug information    */
client.on("debug", function(info){
    if(config.DEBUG) console.log(`debug -> ${info}`);
});

// disconnect
/* Emitted when the client's WebSocket disconnects and will no longer attempt to reconnect.
PARAMETER    TYPE              DESCRIPTION
Event        CloseEvent        The WebSocket close event    */
client.on("disconnect", function(event){
    if(config.DEBUG) console.log(`The WebSocket has closed and will no longer attempt to reconnect`);
});

// emojiCreate
/* Emitted whenever a custom emoji is created in a guild.
PARAMETER    TYPE          DESCRIPTION
emoji        Emoji         The emoji that was created    */
client.on("emojiCreate", function(emoji){
    if(config.DEBUG) console.log(`a custom emoji is created in a guild`);
});

// emojiDelete
/* Emitted whenever a custom guild emoji is deleted.
PARAMETER    TYPE         DESCRIPTION
emoji        Emoji        The emoji that was deleted    */
client.on("emojiDelete", function(emoji){
    if(config.DEBUG) console.log(`a custom guild emoji is deleted`);
});

// emojiUpdate
/* Emitted whenever a custom guild emoji is updated.
PARAMETER    TYPE       DESCRIPTION
oldEmoji     Emoji      The old emoji
newEmoji     Emoji      The new emoji    */
client.on("emojiUpdate", function(oldEmoji, newEmoji){
    if(config.DEBUG) console.log(`a custom guild emoji is updated`);
});

// error
/* Emitted whenever the client's WebSocket encounters a connection error.
PARAMETER    TYPE     DESCRIPTION
error        Error    The encountered error    */
client.on("error", function(error){
    if(config.DEBUG) console.error(`client's WebSocket encountered a connection error: ${error}`);
});

// guildBanAdd
/* Emitted whenever a member is banned from a guild.
PARAMETER    TYPE          DESCRIPTION
guild        Guild         The guild that the ban occurred in
user         User          The user that was banned    */
client.on("guildBanAdd", function(guild, user){
    if(config.DEBUG) console.log(`a member is banned from a guild`);
});

// guildBanRemove
/* Emitted whenever a member is unbanned from a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The guild that the unban occurred in
user         User         The user that was unbanned    */
client.on("guildBanRemove", function(guild, user){
    if(config.DEBUG) console.log(`a member is unbanned from a guild`);
});

// guildCreate
/* Emitted whenever the client joins a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The created guild    */
client.on("guildCreate", function(guild){
    if(config.DEBUG) console.log(`the client joins a guild`);
});

// guildDelete
/* Emitted whenever a guild is deleted/left.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The guild that was deleted    */
client.on("guildDelete", function(guild){
    if(config.DEBUG) console.log(`the client deleted/left a guild`);
});

// guildMemberAdd
/* Emitted whenever a user joins a guild.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that has joined a guild    */
client.on("guildMemberAdd", function(member){
    if(config.DEBUG) console.log(`a user joins a guild: ${member.tag}`);
});

// guildMemberAvailable
/* Emitted whenever a member becomes available in a large guild.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that became available    */
client.on("guildMemberAvailable", function(member){
    if(config.DEBUG) console.log(`member becomes available in a large guild: ${member.tag}`);
});

// guildMemberRemove
/* Emitted whenever a member leaves a guild, or is kicked.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that has left/been kicked from the guild    */
client.on("guildMemberRemove", function(member){
    if(config.DEBUG) console.log(`a member leaves a guild, or is kicked: ${member.tag}`);
});

// guildMembersChunk
/* Emitted whenever a chunk of guild members is received (all members come from the same guild).
PARAMETER      TYPE                      DESCRIPTION
members        Array<GuildMember>        The members in the chunk
guild          Guild                     The guild related to the member chunk    */
client.on("guildMembersChunk", function(members, guild){
    if(config.DEBUG) console.error(`a chunk of guild members is received`);
});

// guildMemberSpeaking
/* Emitted once a guild member starts/stops speaking.
PARAMETER     TYPE                DESCRIPTION
member        GuildMember         The member that started/stopped speaking
speaking      boolean             Whether or not the member is speaking    */
client.on("guildMemberSpeaking", function(member, speaking){
    if(config.DEBUG) console.log(`a guild member starts/stops speaking: ${member.tag}`);
});
// guildMemberUpdate
/* Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
PARAMETER    TYPE               DESCRIPTION
oldMember    GuildMember        The member before the update
newMember    GuildMember        The member after the update    */
client.on("guildMemberUpdate", function(oldMember, newMember){
    if(config.DEBUG) console.error(`a guild member changes - i.e. new role, removed role, nickname.`);
});

// guildUnavailable
/* Emitted whenever a guild becomes unavailable, likely due to a server outage.
PARAMETER    TYPE          DESCRIPTION
guild        Guild         The guild that has become unavailable    */
client.on("guildUnavailable", function(guild){
    if(config.DEBUG) console.error(`a guild becomes unavailable, likely due to a server outage: ${guild}`);
});

// guildUpdate
/* Emitted whenever a guild is updated - e.g. name change.
PARAMETER     TYPE      DESCRIPTION
oldGuild      Guild     The guild before the update
newGuild      Guild     The guild after the update    */
client.on("guildUpdate", function(oldGuild, newGuild){
    if(config.DEBUG) console.error(`a guild is updated`);
});

// messageDelete
/* Emitted whenever a message is deleted.
PARAMETER      TYPE           DESCRIPTION
message        Message        The deleted message    */
client.on("messageDelete", function(message){
    if(config.DEBUG) console.log(`message is deleted -> ${message}`);
});

// messageDeleteBulk
/* Emitted whenever messages are deleted in bulk.
PARAMETER    TYPE                              DESCRIPTION
messages     Collection<Snowflake, Message>    The deleted messages, mapped by their ID    */
client.on("messageDeleteBulk", function(messages){
    if(config.DEBUG) console.log(`messages are deleted -> ${messages}`);
});

// messageReactionAdd
/* Emitted whenever a reaction is added to a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that applied the emoji or reaction emoji     */
client.on("messageReactionAdd", function(messageReaction, user){
    if(config.DEBUG) console.log(`a reaction is added to a message`);
});

// messageReactionRemove
/* Emitted whenever a reaction is removed from a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that removed the emoji or reaction emoji     */
client.on("messageReactionRemove", function(messageReaction, user){
    if(config.DEBUG) console.log(`a reaction is removed from a message`);
});

// messageReactionRemoveAll
/* Emitted whenever all reactions are removed from a message.
PARAMETER          TYPE           DESCRIPTION
message            Message        The message the reactions were removed from    */
client.on("messageReactionRemoveAll", function(message){
    if(config.DEBUG) console.error(`all reactions are removed from a message`);
});

// messageUpdate
/* Emitted whenever a message is updated - e.g. embed or content change.
PARAMETER     TYPE           DESCRIPTION
oldMessage    Message        The message before the update
newMessage    Message        The message after the update    */
client.on("messageUpdate", function(oldMessage, newMessage){
    if(config.DEBUG) console.log(`a message is updated`);
});

// presenceUpdate
/* Emitted whenever a guild member's presence changes, or they change one of their details.
PARAMETER    TYPE               DESCRIPTION
oldMember    GuildMember        The member before the presence update
newMember    GuildMember        The member after the presence update    */
client.on("presenceUpdate", function(oldMember, newMember){
    if(config.DEBUG) console.log(`a guild member's presence changes`);
});

// reconnecting
/* Emitted whenever the client tries to reconnect to the WebSocket.    */
client.on("reconnecting", function(){
    if(config.DEBUG) console.log(`client tries to reconnect to the WebSocket`);
});

// resume
/* Emitted whenever a WebSocket resumes.
PARAMETER    TYPE          DESCRIPTION
replayed     number        The number of events that were replayed    */
client.on("resume", function(replayed){
    if(config.DEBUG) console.log(`whenever a WebSocket resumes, ${replayed} replays`);
});

// roleCreate
/* Emitted whenever a role is created.
PARAMETER    TYPE        DESCRIPTION
role         Role        The role that was created    */
client.on("roleCreate", function(role){
    if(config.DEBUG) console.error(`a role is created`);
});

// roleDelete
/* Emitted whenever a guild role is deleted.
PARAMETER    TYPE        DESCRIPTION
role         Role        The role that was deleted    */
client.on("roleDelete", function(role){
    if(config.DEBUG) console.error(`a guild role is deleted`);
});

// roleUpdate
/* Emitted whenever a guild role is updated.
PARAMETER      TYPE        DESCRIPTION
oldRole        Role        The role before the update
newRole        Role        The role after the update    */
client.on("roleUpdate", function(oldRole, newRole){
    if(config.DEBUG) console.error(`a guild role is updated`);
});

// typingStart
/* Emitted whenever a user starts typing in a channel.
PARAMETER      TYPE            DESCRIPTION
channel        Channel         The channel the user started typing in
user           User            The user that started typing    */
client.on("typingStart", function(channel, user){
    if(config.DEBUG) console.log(`${user.tag} has started typing`);
});

// typingStop
/* Emitted whenever a user stops typing in a channel.
PARAMETER       TYPE           DESCRIPTION
channel         Channel        The channel the user stopped typing in
user            User           The user that stopped typing    */
client.on("typingStop", function(channel, user){
    if(config.DEBUG) console.log(`${user.tag} has stopped typing`);
});

// userNoteUpdate
/* Emitted whenever a note is updated.
PARAMETER      TYPE          DESCRIPTION
user           User          The user the note belongs to
oldNote        String        The note content before the update
newNote        String        The note content after the update    */
client.on("userNoteUpdate", function(user, oldNote, newNote){
    if(config.DEBUG) console.log(`a member's note is updated`);
});

// userUpdate
/* Emitted whenever a user's details (e.g. username) are changed.
PARAMETER      TYPE        DESCRIPTION
oldUser        User        The user before the update
newUser        User        The user after the update    */
client.on("userUpdate", function(oldUser, newUser){
    if(config.DEBUG) console.log(`user's details (e.g. username) are changed`);
});

// voiceStateUpdate
/* Emitted whenever a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
PARAMETER    TYPE             DESCRIPTION
oldMember    GuildMember      The member before the voice state update
newMember    GuildMember      The member after the voice state update    */
client.on("voiceStateUpdate", function(oldMember, newMember){
    if(config.DEBUG) console.log(`a user changes voice state`);
});

// warn
/* Emitted for general warnings. 
PARAMETER    TYPE       DESCRIPTION
info         string     The warning   */
client.on("warn", function(info){
    log(`warn: ${info}`);
});

// Connect the bot to the discord servers
client.login(config.discord.token);

