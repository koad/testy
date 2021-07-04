//  Testy the Discord Example Bot!	
//
//
//  An example chat bot that uses Discord.js and features optional support for a DDP websocket
// 
// 	Extremely Experimental!  As far as you are concerned, this software is not tested at all!
//  Learn from this, do not just copy it mofo!

			/*      
				koad-was-here  
				b25lIEdvZCwgb25lIGxvdmUu          
											*/

// This repo could be used as a module for indie.express and is compatible with the `koad-io://social-tools` drop-in

const Discord = require('discord.js');
const homedir = require('os').homedir();
const datadir = process.env.DATADIR || homedir + '/.discord-example-bot/'

// Define some globally accessable modules
Client = new Discord.Client(); 
signale = require('signale');
mkdirp = require('mkdirp');
fs = require('fs');

// Add timestamp and date to signale outputs
signale.config({
  displayTimestamp: true,
  displayDate: true
});

// load the config file from the datadir
try{
	config = require(datadir+'/config.js');
}
catch(err) {
	signale.fatal(`\n\n\nConfig file not found in ${datadir}, did you set the bot up right?\n\ntry again\n`);
	process.exit(1); // exit with error.
}

if (config.clearConsole) process.stdout.write('\033c');  // clear the console, useful
signale.info(`loading testy using datadir: ${datadir}`);

// Check and see if there is a banner in the datadir, if so -- show it.
fs.readFile(datadir+'banner', function (err, data) {
	if (err) {
		signale.info(`Support the Canada eCoin project -> canadaecoin.ca`);
	} else {
		signale.log(`\n\x1b[1m${data.toString()}\x1b[0m\n`);
	}
});

// Success loading our config files, perfect.
// lets print that out if debug is set to true in our config file.
if(config.DEBUG) signale.debug(config);

// lets set some handy known variables, globally
SECONDS = 1000;
MINUTES = SECONDS * 60;
HOURS = MINUTES * 60;
DAYS = HOURS * 24;
DEBUG = config.debug;

// Use the built in utility functions in Discord to manage some in-memory type collections
// This is where we will load our command and utility scripts in from our data directory.
// These collections are not persistent, and will need to be repopulated every time we start our bot.
Client.commands = new Discord.Collection();
Client.utilities = new Discord.Collection();

// we will also use in-memory collections to handle some session variables
Client.session = new Discord.Collection();

// we will also use in-memory collections to handle some prefixes
Client.prefixes = new Discord.Collection();

// also keep track of some activity stats
Client.activities = new Discord.Collection();

// Sometimes you just gotta slow it down
Client.locks = new Discord.Collection();

// If we specified a ddp server within our config, lets connect to it and leave it global
// so the commands and utilities can access it.
if(config.ddp){
	var DDPClient = require("async-ddp-client");
	var WebSocket = require('ws');

	Marsha = new DDPClient({  						// Globally accessible
	  // All properties optional, defaults shown
	  host : config.ddp.host,
	  port : config.ddp.port || 3000,
	  ssl  : config.ddp.ssl || false,
	  autoReconnect : true,
	  autoReconnectTimer : 2500,
	  maintainCollections : true,
	  appId: config.appId,
	  ddpVersion : '1',  // ['1', 'pre2', 'pre1'] available
	  // Use a full url instead of a set of `host`, `port` and `ssl`
	  // url: 'wss://example.com/websocket'
	  socketContructor: WebSocket // Another constructor to create new WebSockets
	});

	// * Useful for debugging and learning the ddp protocol
	Marsha.on('message', function (msg) {
		if(config.DEBUG) signale.info("ddp message: " + msg);
	});

	Marsha.on('socket-close', function(code, message) {
		signale.debug("Disconnected from server (%s %s)", code, message);
		Marsha.isConnected = false;
		Marsha._reconTimer = new Date();
	});

	Marsha.on('socket-error', function(error) {
		signale.fatal("Error: %j", error);
	});

	Marsha.connect(function(error, wasReconnect) {
		// If autoReconnect is true, this callback will be invoked each time
		// a server connection is re-established
		if (error) return signale.fatal('DDP connection error!');
		Marsha.isConnected = true;

		if (wasReconnect) {
			signale.success('reconnected to DDP');
		} else {
			signale.success("connected to DDP");
		}

		signale.debug(JSON.stringify({ user : { username : config.ddp.username }, password : config.ddp.password }))

		// logging in with username
		Marsha.call("login", { resume: config.ddp.token })
		.then((err, result) => {
			if(err) return signale.fatal('unable to log into Marsha', err)
			console.log("result:", result);
			console.log("err:", err);
			Marsha._loginToken = result
			Marsha._isLoggedIn = Marsha._loginToken.id

			let users = Marsha.collections.users
			signale.info(`${users.find({}).length} users loaded in mempool`);

			let user = users.findOne({_id: Marsha._isLoggedIn})
			if(!user) return signale.fatal('Cannot log in to DDP; user data not found!')

			// Once we are logged in, we can call on our subscriptions and reload the in-mem collections		
			if(user.discord && user.discord.prefixes) user.discord.prefixes.forEach(function myFunction(item, index) {
				Client.prefixes.set(item.guild, item.prefix);
			});
			signale.success('prefix data loaded from Marsha');
			if(DEBUG) signale.debug(user.discord.prefixes);

			if(Marsha.collections.discordGuilds) {
				signale.info(`bringing forward activity data for ${Marsha.collections.discordGuilds.find({}).length} guilds`);
				guildActivity = []
				Marsha.collections.discordGuilds.find({}).forEach(function myFunction(guild, index) {
					if(guild.activities && guild.activities.length){
						guild.activities.forEach(function myFunction(activity, index) {
							guildActivity[activity.user] = activity.when;
						});
						Client.activities.set(guild.guildid, guildActivity);
					}
				});
			};

			if(Marsha.collections.discordChannels) {
				signale.info(`bringing forward activity data for ${Marsha.collections.discordChannels.find({}).length} channels`);
				channelActivity = []
				Marsha.collections.discordChannels.find({}).forEach(function myFunction(channel, index) {
					if(channel.activities && channel.activities.length){
						channel.activities.forEach(function myFunction(activity, index) {
							channelActivity[activity.user] = activity.when;
						});
						Client.activities.set(channel.channelid, channelActivity);
					}
				});
			};

		});

		/*
		* If you need to do something specific on close or errors.
		* You can also disable autoReconnect and
		* call Marsha.connect() when you are ready to re-connect.
		*/

	});
} else Marsha = false;

// Load the commands from files.
var totalCommands = 0;
fs.readdir(datadir+'commands/', (err, files) => {
	if(err) signale.fatal(`\n\n\nNo commands directory found at "${datadir}commands/", did you set the bot up right?\n\ntry again, you need at least 1 command to continue.\n`);
	if(err) process.exit(1); // exit with error.

	// grab any file within our directly that end in `.js`
	let jsfile = files.filter(f=> f.split(".").pop() === "js")
	if(jsfile.length <= 0) signale.fatal(`\n\n\nNo commands found in "${datadir}commands/", did you set the bot up right?\n\ntry again, you need at least 1 command to continue.\n`);
	if(jsfile.length <= 0) process.exit(1); // exit with error.

	// load each command into our in-memory storage
	jsfile.forEach((file, i) => {
		let props = require(`${datadir}commands/${file}`)
		if(config.DEBUG) signale.info(`${datadir}commands/${file} is loaded`);
		Client.commands.set(props.meta.name, props);
		totalCommands++;

		// if the file contains aliases, ensure to save them as commands too.
		if(props.meta && props.meta.aliases) props.meta.aliases.forEach(function(element) {
			Client.commands.set(element, {
				meta: {isAlias: true},
				run: props.run
			});
		});
	});
	signale.success(`Total commands loaded: ${totalCommands}`);
});

// Load the utilities from files.
var totalUtilities = 0;
fs.readdir(datadir+'utilities/', (err, files) => {
	if(err) {
		signale.fatal(`\n\n\nNo utilities directory found at "${datadir}utilities/", did you set the bot up right?\n\ntry again, you need at least 1 utility to continue.\n`);
		process.exit(1); // exit with error.
	}

	let jsfile = files.filter(f=> f.split(".").pop() === "js")

	if(jsfile.length <= 0){
		signale.fatal(`\n\n\nNo utilities found in "${datadir}utilities/", did you set the bot up right?\n\ntry again, you need at least 1 utility to continue.\n`);
		process.exit(1); // exit with error.
	}

	jsfile.forEach((file, i) => {
		let props = require(`${datadir}utilities/${file}`)
		if(config.DEBUG) signale.info(`${datadir}utilities/${file} is loaded`);
		Client.utilities.set(props.meta.name, props);
		totalUtilities++;
	});

	signale.success(`Total utilities loaded: ${totalUtilities}`);
});

// Lets run a loop for whatever reason, you decide.
setInterval(function(){ 
	signale.info(`Guilds (${Client.guilds.size}): ${Client.guilds.map(g => g.name).join(", ")}`);
}, 100000);


// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// 
// Everything below this line is listening for certain events from Discord and acting upon those events.
//
// The few discord.js events that this bot uses (out of the box) are listed up top -- then the rest in alphabetical order
// for you to do your magic with.  Look at the top few events for inspiration and guidance
//

// ready
/* Emitted when the Client becomes ready to start working.    */
Client.on("ready", function(){
	signale.success(`I am ready! Logged in as ${Client.user.tag}!`);
	signale.success(`Bot has started, with ${Client.users.size} users, in ${Client.channels.size} channels of ${Client.guilds.size} guilds.`); 

	Client.user.setStatus(config.initalStatus, 'Made by koad');
	Client.user.setActivity(config.initalActivity);
	Client.generateInvite(config.permissions)
	.then(link => {
		signale.success(`Generated bot invite link\n\n\x1b[1m${link}\x1b[0m\n`);
		Client.inviteLink = link;
	});

	// Load the utilities that have the init event set to true in their metadata
	Client.utilities.filterArray(o => o.meta.init && o.meta.init == true && o.meta.disabled != true).forEach(function(utility) {
		utility.run();
	});
});

// message
/* Emitted whenever a message is created.
PARAMETER      TYPE           DESCRIPTION
message        Message        The created message    */
Client.on("message", function(message){
	// first off, if the message came from us, then just ignore it.
	if(message.author.id === Client.user.id) return signale.debug('message came from the self, ignoring');

	// if in debug mode clear the console upon new messages
	// useful for isolating response data within the console
	if(config.clearConsole) process.stdout.write('\033c');  

	const amMentioned = message.isMentioned(Client.user.id);
	let inboundMessage = message.content
	var prefix = null;
 	// Find out if we have an alternate prefix stored somewhere for this guild
	if(message.channel.type != "dm") prefix = Client.prefixes.get(message.guild.id) || config.prefix;

	// either we have a prefix, there is no prefix, or we were mentioned.
	if(message.content.charAt(0) == prefix) {
		message.args = inboundMessage.slice(prefix.length).trim().split(/ +/g);
		message.prefix = prefix;
	} else {
		message.args = inboundMessage.trim().split(/ +/g);
	};

	// if we were mentioned, fake the prefix.
	if(message.isMentioned(Client.user.id) && !message.prefix) {
		message.prefix = prefix;
	};

	// if we are in a DM, supress the prefix.
	if(message.channel.type == "dm" && !message.prefix) {
		message.prefix = "";
	};

	// Parse out the arguments
	message.command = message.args.shift().toLowerCase(); // Get the command from the first argument

	// send this message to any utilities that are for processing raw messages, then we can dismiss it if we want
	Client.utilities.filterArray(o => o.meta.events && o.meta.events.includes('messages') && o.meta.disabled != true).forEach(function(utility) {
		utility.run(message);
	});

	// now, if the message comes from another bot, then just ignore it.
	if(message.author.bot) return;

	// If whole message is our prefix, lets lift a brow (ack)
	if(message.content === prefix) return message.reply('sup?');

	// If the message is the word 'exit', its likely the user has typed into the wrong window, lets laugh at them
	if(message.content === 'exit') return message.reply('lol.  Wrong window :stuck_out_tongue:');

	// If we havent found any execution commandment; either a prefix, a mention or a DM where we flagged the prefix as an empty string above
	if(!message.prefix && message.prefix != "") return signale.info('no commandment detected, exiting...');

	// If we are in maintenance mode, then return a reply saying so.
	if(config.maint.enabled == true && message.author.id != config.owner) return message.reply(config.maint.message); 

	// If the disableEveryone flag is found within the config, then make sure only the owner can play.
	if(config.disableEveryone && message.author.id != config.owner) return message.reply('I cannot do that for you in this moment,..  Sorry.'); 

	// We only really want users to interact with the bot, so lets verify that now.  This 
	// shouldnt really need to be done, but lets be paranoid here about things.
	Client.fetchUser(message.author.id)
	.then((user) => {
		// If there is a command in our collection with the matching name as our first argument, then load it.
		let command = Client.commands.get(message.command);
		if (command && command.meta.disabled != true){ 
			if(command.meta.experimental == true && config.owner != message.author.id){
				return message.reply("I can't do that for you yet, sorry...\`\`\`The command you are attempting to run is currently in maintenance mode and is unavailable at this time,  try your call again later.\`\`\`");
			} else {
				signale.success(`running command ${message.command}`)
				command.run(message);
			}
		} else {
			// let the user know we are paying attention,
    		if(message.channel.type != "dm" && config.unknownCommandResponse) message.reply("You talk'n to me?");
			return signale.info(`thought i might have been commanded, but could not find a command called "${message.command}", exiting...`)
		}
	})
	.catch((err) => {
		signale.fatal('message has no user', err);
	});
});

// messageDelete
/* Emitted whenever a message is deleted.
PARAMETER      TYPE           DESCRIPTION
message        Message        The deleted message    */
Client.on("messageDelete", function(message){
	if(config.DEBUG) signale.info(`message is deleted -> ${message}`);

	// If this code block was moved to a `all events` emitter, then the code would look nicer/cleaner. 
	// there is an event available via discord.js called raw, maybe a TODO 4 l8r?
	Client.utilities.filterArray(o => o.meta.events && o.meta.events.includes('messageDelete')).forEach(function(utility) {

		utility.run(message);
	});

	// TODO: Look into this,
	// For some reason, 'messageDelete' is only being called when messages that are new since bot came online,
	// You might want to cache any messages that are still active for whatever reason into a DB
	// ie: voting / polls / reactions
});

// raw
/* Emitted on every event. 
PARAMETER       TYPE       DESCRIPTION
data            Raw        All the data the event has to offer   */

// Thanks do Daro for uncovering this handy listener.  We can use this to launch commands and utilities instead
// of having to do it within each and every different event. 
Client.on("raw", function(data){
	// there is alot of info in this data object...
	// if(config.DEBUG) signale.info(`raw: ${JSON.stringify(data, null, 4)}`);
});

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// the rest of'm, in alphabetical order
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// channelCreate
/* Emitted whenever a channel is created.
PARAMETER    TYPE        DESCRIPTION
channel      Channel     The channel that was created    */
Client.on("channelCreate", function(channel){
	if(config.DEBUG) signale.info(`channelCreate: ${channel}`);
});

// channelDelete
/* Emitted whenever a channel is deleted.
PARAMETER   TYPE      DESCRIPTION
channel     Channel   The channel that was deleted    */
Client.on("channelDelete", function(channel){
	if(config.DEBUG) signale.info(`channelDelete: ${channel}`);
});

// channelPinsUpdate
/* Emitted whenever the pins of a channel are updated. Due to the nature of the WebSocket 
event, not much information can be provided easily here - you need to manually check 
the pins yourself.
PARAMETER    TYPE         DESCRIPTION
channel      Channel      The channel that the pins update occurred in
time         Date         The time of the pins update    */
Client.on("channelPinsUpdate", function(channel, time){
	if(config.DEBUG) signale.info(`channelPinsUpdate: ${channel}:${time}`);
});
	
// channelUpdate
/* Emitted whenever a channel is updated - e.g. name change, topic change.
PARAMETER        TYPE        DESCRIPTION
oldChannel       Channel     The channel before the update
newChannel       Channel     The channel after the update    */
Client.on("channelUpdate", function(oldChannel, newChannel){
	if(config.DEBUG) signale.info(`channelUpdate -> a channel is updated - e.g. name change, topic change`);
});

// ClientUserGuildSettingsUpdate
/* Emitted whenever the Client user's settings update.
PARAMETER                  TYPE                       DESCRIPTION
ClientUserGuildSettings    ClientUserGuildSettings    The new Client user guild settings    */
Client.on("ClientUserGuildSettingsUpdate", function(ClientUserGuildSettings){
	if(config.DEBUG) signale.info(`ClientUserGuildSettingsUpdate -> Client user's settings update`);
});

// ClientUserSettingsUpdate
/* Emitted when the Client user's settings update.
PARAMETER             TYPE                  DESCRIPTION
ClientUserSettings    ClientUserSettings    The new Client user settings    */
Client.on("ClientUserSettingsUpdate", function(ClientUserSettings){
	if(config.DEBUG) signale.info(`ClientUserSettingsUpdate -> Client user's settings update`);
});

// debug
/* Emitted for general debugging information.
PARAMETER    TYPE         DESCRIPTION
info         string       The debug information    */
Client.on("debug", function(info){
	if(config.DEBUG) signale.debug(info);
});

// disconnect
/* Emitted when the Client's WebSocket disconnects and will no longer attempt to reconnect.
PARAMETER    TYPE              DESCRIPTION
Event        CloseEvent        The WebSocket close event    */
Client.on("disconnect", function(event){
	if(config.DEBUG) signale.info(`The WebSocket has closed and will no longer attempt to reconnect`);
});

// emojiCreate
/* Emitted whenever a custom emoji is created in a guild.
PARAMETER    TYPE          DESCRIPTION
emoji        Emoji         The emoji that was created    */
Client.on("emojiCreate", function(emoji){
	if(config.DEBUG) signale.info(`a custom emoji is created in a guild`);
});

// emojiDelete
/* Emitted whenever a custom guild emoji is deleted.
PARAMETER    TYPE         DESCRIPTION
emoji        Emoji        The emoji that was deleted    */
Client.on("emojiDelete", function(emoji){
	if(config.DEBUG) signale.info(`a custom guild emoji is deleted`);
});

// emojiUpdate
/* Emitted whenever a custom guild emoji is updated.
PARAMETER    TYPE       DESCRIPTION
oldEmoji     Emoji      The old emoji
newEmoji     Emoji      The new emoji    */
Client.on("emojiUpdate", function(oldEmoji, newEmoji){
	if(config.DEBUG) signale.info(`a custom guild emoji is updated`);
});

// error
/* Emitted whenever the Client's WebSocket encounters a connection error.
PARAMETER    TYPE     DESCRIPTION
error        Error    The encountered error    */
Client.on("error", function(error){
	if(config.DEBUG) signale.fatal(`Client's WebSocket encountered a connection error: ${error}`);
});

// guildBanAdd
/* Emitted whenever a member is banned from a guild.
PARAMETER    TYPE          DESCRIPTION
guild        Guild         The guild that the ban occurred in
user         User          The user that was banned    */
Client.on("guildBanAdd", function(guild, user){
	if(config.DEBUG) signale.info(`a member is banned from a guild`);
});

// guildBanRemove
/* Emitted whenever a member is unbanned from a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The guild that the unban occurred in
user         User         The user that was unbanned    */
Client.on("guildBanRemove", function(guild, user){
	if(config.DEBUG) signale.info(`a member is unbanned from a guild`);
});

// guildCreate
/* Emitted whenever the Client joins a guild.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The created guild    */
Client.on("guildCreate", function(guild){
	if(config.DEBUG) signale.info(`the Client joins a guild`);
});

// guildDelete
/* Emitted whenever a guild is deleted/left.
PARAMETER    TYPE         DESCRIPTION
guild        Guild        The guild that was deleted    */
Client.on("guildDelete", function(guild){
	if(config.DEBUG) signale.info(`the Client deleted/left a guild`);
});

// guildMemberAdd
/* Emitted whenever a user joins a guild.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that has joined a guild    */
Client.on("guildMemberAdd", function(member){
	if(config.DEBUG) signale.info(`a user joins a guild: ${member.tag}`);
});

// guildMemberAvailable
/* Emitted whenever a member becomes available in a large guild.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that became available    */
Client.on("guildMemberAvailable", function(member){
	if(config.DEBUG) signale.info(`member becomes available in a large guild: ${member.tag}`);
});

// guildMemberRemove
/* Emitted whenever a member leaves a guild, or is kicked.
PARAMETER     TYPE               DESCRIPTION
member        GuildMember        The member that has left/been kicked from the guild    */
Client.on("guildMemberRemove", function(member){
	if(config.DEBUG) signale.info(`a member leaves a guild, or is kicked: ${member.tag}`);
});

// guildMembersChunk
/* Emitted whenever a chunk of guild members is received (all members come from the same guild).
PARAMETER      TYPE                      DESCRIPTION
members        Array<GuildMember>        The members in the chunk
guild          Guild                     The guild related to the member chunk    */
Client.on("guildMembersChunk", function(members, guild){
	if(config.DEBUG) signale.info(`a chunk of guild members is received`);
});

// guildMemberSpeaking
/* Emitted once a guild member starts/stops speaking.
PARAMETER     TYPE                DESCRIPTION
member        GuildMember         The member that started/stopped speaking
speaking      boolean             Whether or not the member is speaking    */
Client.on("guildMemberSpeaking", function(member, speaking){
	if(config.DEBUG) signale.info(`a guild member starts/stops speaking: ${member.tag}`);
});
// guildMemberUpdate
/* Emitted whenever a guild member changes - i.e. new role, removed role, nickname.
PARAMETER    TYPE               DESCRIPTION
oldMember    GuildMember        The member before the update
newMember    GuildMember        The member after the update    */
Client.on("guildMemberUpdate", function(oldMember, newMember){
	if(config.DEBUG) signale.info(`a guild member changes - i.e. new role, removed role, nickname.`);
});

// guildUnavailable
/* Emitted whenever a guild becomes unavailable, likely due to a server outage.
PARAMETER    TYPE          DESCRIPTION
guild        Guild         The guild that has become unavailable    */
Client.on("guildUnavailable", function(guild){
	if(config.DEBUG) signale.fatal(`a guild becomes unavailable, likely due to a server outage: ${guild}`);
});

// guildUpdate
/* Emitted whenever a guild is updated - e.g. name change.
PARAMETER     TYPE      DESCRIPTION
oldGuild      Guild     The guild before the update
newGuild      Guild     The guild after the update    */
Client.on("guildUpdate", function(oldGuild, newGuild){
	if(config.DEBUG) signale.info(`a guild is updated`);
});

// messageDeleteBulk
/* Emitted whenever messages are deleted in bulk.
PARAMETER    TYPE                              DESCRIPTION
messages     Collection<Snowflake, Message>    The deleted messages, mapped by their ID    */
Client.on("messageDeleteBulk", function(messages){
	if(config.DEBUG) signale.info(`messages are deleted -> ${messages}`);
});

// messageReactionAdd
/* Emitted whenever a reaction is added to a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that applied the emoji or reaction emoji     */
Client.on("messageReactionAdd", function(messageReaction, user){
	if(config.DEBUG) signale.info(`a reaction is added to a message`);
});

// messageReactionRemove
/* Emitted whenever a reaction is removed from a message.
PARAMETER              TYPE                   DESCRIPTION
messageReaction        MessageReaction        The reaction object
user                   User                   The user that removed the emoji or reaction emoji     */
Client.on("messageReactionRemove", function(messageReaction, user){
	if(config.DEBUG) signale.info(`a reaction is removed from a message`);
});

// messageReactionRemoveAll
/* Emitted whenever all reactions are removed from a message.
PARAMETER          TYPE           DESCRIPTION
message            Message        The message the reactions were removed from    */
Client.on("messageReactionRemoveAll", function(message){
	if(config.DEBUG) signale.info(`all reactions are removed from a message`);
});

// messageUpdate
/* Emitted whenever a message is updated - e.g. embed or content change.
PARAMETER     TYPE           DESCRIPTION
oldMessage    Message        The message before the update
newMessage    Message        The message after the update    */
Client.on("messageUpdate", function(oldMessage, newMessage){
	if(config.DEBUG) signale.info(`a message is updated`);
});

// presenceUpdate
/* Emitted whenever a guild member's presence changes, or they change one of their details.
PARAMETER    TYPE               DESCRIPTION
oldMember    GuildMember        The member before the presence update
newMember    GuildMember        The member after the presence update    */
Client.on("presenceUpdate", function(oldMember, newMember){
	if(config.DEBUG && config.DEBUG == "verbose") signale.info(`a guild member's presence changes`);
});

// reconnecting
/* Emitted whenever the Client tries to reconnect to the WebSocket.    */
Client.on("reconnecting", function(){
	if(config.DEBUG) signale.info(`Client trying to reconnect to the WebSocket`);
});

// resume
/* Emitted whenever a WebSocket resumes.
PARAMETER    TYPE          DESCRIPTION
replayed     number        The number of events that were replayed    */
Client.on("resume", function(replayed){
	if(config.DEBUG) signale.info(`a WebSocket has resumed: ${replayed} replays`);
});

// roleCreate
/* Emitted whenever a role is created.
PARAMETER    TYPE        DESCRIPTION
role         Role        The role that was created    */
Client.on("roleCreate", function(role){
	if(config.DEBUG) signale.info(`a role is created`);
});

// roleDelete
/* Emitted whenever a guild role is deleted.
PARAMETER    TYPE        DESCRIPTION
role         Role        The role that was deleted    */
Client.on("roleDelete", function(role){
	if(config.DEBUG) signale.info(`a guild role is deleted`);
});

// roleUpdate
/* Emitted whenever a guild role is updated.
PARAMETER      TYPE        DESCRIPTION
oldRole        Role        The role before the update
newRole        Role        The role after the update    */
Client.on("roleUpdate", function(oldRole, newRole){
	if(config.DEBUG) signale.info(`a guild role is updated`);
});

// typingStart
/* Emitted whenever a user starts typing in a channel.
PARAMETER      TYPE            DESCRIPTION
channel        Channel         The channel the user started typing in
user           User            The user that started typing    */
Client.on("typingStart", function(channel, user){
	if(config.DEBUG) signale.info(`${user.tag} has started typing`);
});

// typingStop
/* Emitted whenever a user stops typing in a channel.
PARAMETER       TYPE           DESCRIPTION
channel         Channel        The channel the user stopped typing in
user            User           The user that stopped typing    */
Client.on("typingStop", function(channel, user){
	if(config.DEBUG) signale.info(`${user.tag} has stopped typing`);
});

// userNoteUpdate
/* Emitted whenever a note is updated.
PARAMETER      TYPE          DESCRIPTION
user           User          The user the note belongs to
oldNote        String        The note content before the update
newNote        String        The note content after the update    */
Client.on("userNoteUpdate", function(user, oldNote, newNote){
	if(config.DEBUG) signale.info(`a member's note is updated`);
});

// userUpdate
/* Emitted whenever a user's details (e.g. username) are changed.
PARAMETER      TYPE        DESCRIPTION
oldUser        User        The user before the update
newUser        User        The user after the update    */
Client.on("userUpdate", function(oldUser, newUser){
	if(config.DEBUG) signale.info(`user's details (e.g. username) are changed`);
});

// voiceStateUpdate
/* Emitted whenever a user changes voice state - e.g. joins/leaves a channel, mutes/unmutes.
PARAMETER    TYPE             DESCRIPTION
oldMember    GuildMember      The member before the voice state update
newMember    GuildMember      The member after the voice state update    */
Client.on("voiceStateUpdate", function(oldMember, newMember){
	if(config.DEBUG) signale.info(`a user changes voice state`);
});

// warn
/* Emitted for general warnings. 
PARAMETER    TYPE       DESCRIPTION
info         string     The warning   */
Client.on("warn", function(info){
	signale.debug(`warn: ${info}`);
});

// Connect the bot to the discord servers
Client.login(config.discord.token);

