var config = {};

config.name = 'Testy the Example Discord Bot'
config.prefix = '';
config.homeId = 'DISCORD_CHANNEL_ID';
config.copyright = '© kingofalldata.com';

config.initalActivity = 'with Testy';
config.initalStatus = 'dnd';

// config.owner = 'OWNER_DISCORD_ID';
config.owner = ['OWNER_DISCORD_ID', 'OWNER_DISCORD_ID', 'OWNER_DISCORD_ID']; // Multiple Owners

config.DEBUG = 'verbose';
// config.DEBUG = true;
// config.DEBUG = false;
config.clearConsole = true;

config.unknownCommandResponse = false;
config.disableEveryone = true;

config.color = {};
config.color.brand = 2053826;
config.color.alert = 11996943;

config.discord = {};
config.discord.token = process.env.TOKEN || 'PUT YOUR TOKEN IN HERE AFTER MOVING THIS FILE SOMEWHERE SAFE';  // testy

config.mongo = {};
config.mongo.host = 'localhost';
config.mongo.port = 27017;
config.mongo.db = 'testy-discord-bot';

config.web = {};
config.web.port = process.env.WEBPORT || 8080;

module.exports = config;