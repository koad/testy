exports.run = async (client, message, args, config) => {
	const embed = {
		color: config.color.brand,
		author: {
			name: 'Author Name',
			icon_url: 'https://i.imgur.com/lm8s41J.png'
		},
		title: "This is your title, it can hold 256 characters",
		url: "https://discord.js.org/#/docs/main/indev/class/RichEmbed",
		description: "This is the main body of text, it can hold 2048 characters.",
		thumbnail: {
			"url": "http://i.imgur.com/p2qNFag.png"
		},    
		image: {
			"url": "http://i.imgur.com/yVpymuV.png"
		},
		fields: [{
			name: "This is a field title, it can hold 256 characters",
			value: "This is a field value, it can hold 2048 characters."
		},
		{
			name: "Masked links",
			value: "You can put [masked links](http://google.com) inside of rich embeds."
		},
		{
			name: "Markdown",
			value: "You can put all the *usual* **__Markdown__** inside of them."
		},
		{
			name: 'Inline Field',
			value: 'They can also be inline',
			inline: true
		},
		{
			name: 'Inline Field 2',
			value: 'If they are short enuf.',
			inline: true
		},
		{
			name: 'Inline Field 3',
			value: 'You can have a maximum of 25 fields.',
			inline: true
		}
		],
		timestamp: new Date(),
		footer: {
			icon_url: client.user.avatarURL,
			text: config.copyright
		}
	}
	message.reply('', { embed });
};

exports.meta = {
	name: 'example',
	help: 'an example command called example that responds with an example embed.',
	usage: 'example',
	hidden: false
};
