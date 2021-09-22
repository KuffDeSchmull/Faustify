// Require the necessary discord.js classes
const { Client, Intents, VoiceChannel } = require('discord.js');
const { prefix, token } = require('./config.json');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionStatus,
} = require ('@discordjs/voice');


//const { createDiscordJSAdapter } = require ('./adapter');
//yt playback and search
const ytdl = require('ytdl-core');
const yts = require( 'yt-search' )
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
//const connection;
//map song queue and guild
const queue = new Map();
//check if user is in voice chat and if bot has permissions
async function execute(message, serverQueue) {
    const args = message.content.split(" ");

    //console.log(args)
    var voiceChannel = message.member.voice.channel;
    //console.log(voiceChannel.voice)
    //console.log(voiceChannel.isVoice())
    var connection;
    if (!voiceChannel){
        if( typeof connection !== 'undefined'){
            connection.destroy();
        }
        
        return message.channel.send(
            "Du hues keng Moss am Bic!"//you are not in voice chat
          );
    }

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "Zwou Bullen Mokka"//bot has not enough permissions
      );
      
    }
//search for song
const search = args.shift();
let searchString;
for (let i = 0; i < args.length; i++){
    searchString = searchString + " " + args[i];
}
const r = await yts( searchString );
const videos = r.videos.slice( 0, 1);
var url;
videos.forEach( function ( v ) {
	const link = String( v.url )
    //console.log(v);
	url = link;
} );
//only link

var songInfo = await ytdl.getInfo(url);
console.log(songInfo);
const song = {
 title: songInfo.videoDetails.title,
 url: url,
};
//add to queue
if (!serverQueue) { 
// Creating the contract for our queue
const queueContruct = {
    textChannel: message.channel,
    voiceChannel: voiceChannel,
    connection: null,
    songs: [],
    volume: 5,
    playing: true,
   };
   // Setting the queue using our contract
   queue.set(message.guild.id, queueContruct);
   // Pushing the song to our songs array
   queueContruct.songs.push(song);
   console.log(song)//debug undefined
   try {
    // Here we try to join the voicechat and save our connection into our object.
    connection = await joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    queueContruct.connection = connection;
    // Calling the play function to start a song
    play(message.guild, queueContruct.songs[0]);//error serverqueue not init
   } catch (err) {
    // Printing the error message if the bot fails to join the voicechat
    console.log(err);
    console.log("connection failed");
    queue.delete(message.guild.id);
    return message.channel.send(err);
   }
}else {
 serverQueue.songs.push(song);
 console.log(serverQueue.songs);
 return message.channel.send(`${song.title} leeft dem Ketti mat der Wichsbiischt no`);
}
//connect to voice chat of meesenger
  /*  connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
*/


    return;
}

//play the current cong
function play(guild, song) {
console.log("here we are")
    //serverQueue.textChannel.send(`We are here`);
    const serverQueue = queue.get(guild.id);
    //check if queue is empty
    if (!song) {
      serverQueue.connection.destroy();
      queue.delete(guild.id);
      return;
    }
    //recursive queue playback
    const dispatcher = serverQueue.connection
    const player = createAudioPlayer();
    var stream = ytdl(song.url, { filter: 'audioonly' });
    var resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
    
    dispatcher.subscribe(player);
    player.play(resource)//.play(ytdl(song.url))//not a function
    /*.on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
    //dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);*/
    
    player.on(AudioPlayerStatus.Idle, () => {
        serverQueue.songs.shift();
        if(!serverQueue.songs[0]){
            connection.destroy();
            return;
        }
        stream = ytdl(song.url, { filter: 'audioonly' });
        resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
        player.play(resource);
        serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    });
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready now!');
    client.user.setPresence({ activities: [{ name: 'the funkiest beats in town' }], status: 'online' })
});

//functions
/*
client.on('interactionCreate', async interaction => {

    console.log("execution triggered");
    //if message is from bot, the ignore

    if (interaction.author.bot) return;
    //if message does not begin with command prefix, then ignore
    if (!interaction.content.startsWith(prefix)) return;

    //commands

    await interaction.reply('Test command')
    //interaction.send("hola")
});
*/
client.on('messageCreate', (message) => {
	console.log(message.content);

    //if message is from bot, the ignore

    if (message.author.bot) return;
    //if message does not begin with command prefix, then ignore
    if (!message.content.startsWith(prefix)) return;

    //commands
    const serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${prefix}play`)) {
        execute(message, serverQueue);
        console.log("finished execution")
        return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
        //skip(message, serverQueue);
    return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
        //stop(message, serverQueue);
        return;
    } else {
        message.channel.send('Vache Glift? Type !help for command list')
    }




});

client.on('interactionCreate', async interaction => {
	//if (!interaction.isCommand()) return;

	//const { commandName } = interaction;

	/*if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	}*/
    await interaction.reply('2 Bulle Mokka');
});

//
// Login to Discord with your client's token
client.login(token)

