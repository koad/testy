exports.run = async (client, message, args, config) => {
	const embed = {
		"title": 'Command Disabled!',
		"description": "This command is disabled and is not available for use.",
		"color": config.color.alert,
	    "thumbnail": {
	      "url": "https://cdn.discordapp.com/attachments/301104285314318336/471103869586374676/unknown.png"
	    },
		"fields": [{
			"name": "Please try your call again later.",
			"value": ":peace:",
		}]
	}
	message.reply('', { embed });
};

exports.meta = {
	name: 'disabled',
	help: 'a command that says its disabled.  Again, this is an example command that ships with this bot.',
	usage: 'disabled __takes no arguments__',
	hidden: true,
	disabled: true // You can delete this line to enable the utility.
};
