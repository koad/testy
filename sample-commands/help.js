exports.run = async (message) => {

	var fields = [];
	if(client.commands.length == 1){
		fields.push({
			"name": 'Whoops',
			"value": `only the help command exists, not much to display...`,
			"inline": false
		});
		console.log('only the help command exists, not much to display...')
	} else {
		client.commands.forEach(function (element) {
			console.log('yessss--', element);
			if(element.meta.name && element.meta.help && element.meta.usage && !element.meta.hidden && !element.meta.isAlias)
				fields.push({
					"name": config.prefix+element.meta.name,
					"value": `${element.meta.help}\nusage: \`\`${element.meta.usage}\`\``,
					"inline": false
				})
		});
	}

	const embed = {
		"title": `This bot doesnt have a slogan!  Give it one by using the ${config.prefix}slogan command`,
		"description": "Basic commands:",
		"url": "https://kingofalldata.com/",
		"color": config.brandColour,
		"author": {
			"name": client.user.username,
		},
		// "image": {
		// "url": client.user.avatarURL
		// },
		"fields": fields,
		"timestamp": new Date(),
		"footer": {
			icon_url: client.user.avatarURL,
			text: config.copyright
		},
		"thumbnail": {
			"url": client.user.avatarURL
		},
	};

	if(message.channel.type != "dm") {
		client.fetchUser(message.author.id)
		.then((user) => {
			user.send({ embed });
		});
		message.reply(`I have sent you the help you need via \`\`direct message\`\``);
	} else {
		message.reply({ embed });
	}
};

exports.meta = {
	name: 'help',
	help: 'Responds with a this message of help but can also be used to dig deeper on a specified topic.',
	usage: 'help <topic>',
	aliases: ['aider', 'dépanner', 'depanner']
};
