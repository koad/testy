// So even though we are passing the client in to this function will keep up to date with the client
// To prove the concept, remove the disabled and join/leave servers and watch the data update.
exports.run = async (client, message, args, config) => {
	console.log('frank called')
	let franksFartCount = 0;

	// Lets loop and display server info every once in a while.
	setInterval(function(){ 
		franksFartCount++;
	    console.log(`frank farted...${franksFartCount}`);
    	console.log(`Guilds (${client.guilds.size}): ${client.guilds.map(g => g.name).join(", ")}`);
	}, 10000);
};

exports.meta = {
	name: 'frank',
	init: true,
	disabled: true // You can delete this line to enable the utility.
};
