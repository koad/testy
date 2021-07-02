// Dedicated to my home boy Rob (Cacula), rest in peace brother man.

const Reset = "\x1b[0m"
const FgBlack = "\x1b[30m"
const BgRed = "\x1b[41m"

const batmanSaysWhat = `I'm Batman`;

exports.run = async (message) => {
	var n = message.content.search(/batman/i);
	if (n >= 0) {
		message.reply(batmanSaysWhat); 
		console.log(`${BgRed}${FgBlack}  ${batmanSaysWhat}  ${Reset}`);
	}
};

exports.meta = {
	name: 'cacula',
	help: `Responds with "I'm Batman!" whenever the word "Batman" is used in a channel`,
	events: ['messages'],
	disabled: false
};
