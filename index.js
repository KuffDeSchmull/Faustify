const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const client = new Discord.Client();
const https = require('https');
var SpotifyWebApi = require('spotify-web-api-node');
const queue = new Map();
let device; 

client.once("ready", () => {
  console.log("Ready!");
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});


client.on("message", async message => {
  console.log(message.content)
  if (message.author.bot) return;
  const serverQueue = queue.get(message.guild.id); //get the queue for this guild
  if (!message.content.startsWith(prefix)){
    if (message.content.startsWith("https://open.spotify.com/track/")){execute(message, serverQueue);return;} else {return;}
  };

  if (message.content.startsWith(`${prefix}help`)) {
    message.channel.send("send a spotify track link to queue it. Search and queue new songs with !p <keywords>. See the queue with !mlfq. Skip a song with !skip.");
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}mlfq`)) {
    serverQueue.mlfq.forEach(element => element.forEach(e => message.channel.send(e.tackid)))
    return;
  } else {
    message.channel.send("Vache Glift?");
  }
});

async function execute(message, serverQueue){
  //get track id
  const args = message.content.split("/");
  let trackID = args[4].split("?")[0];
  console.log(trackID);
  
  //define track as json obj
  const song = {
        url: message.content,
        trackid: trackID,
        author: message.author
   };
  //if the servers queue does not exist, create one with the queue construct blueprint
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      spotify: [/*FIFO Spotify Queue*/],//normal fifo queue
      mlfq: [[/*Queue highest priority 1*/],[/*Queue priority 2*/],[/*Queue priority 3*/],[/*Queue priority 4*/],[/*Queue lowest priority >5*/]],//if the song to be queued next is not the first one, first swap it until it is, then shift()
      authors: new Map()
    };

    queue.set(message.guild.id, queueConstruct);
    let priority = 0;
    queueConstruct.authors.set(message.author, priority)
    queueConstruct.spotify.push(song);
    spotify(song);
    
  
  } else {
    
    //increase authors priority or add to queue while decreasing all other authors priorities
    if(serverQueue.authors.has(message.author)){//possible MutEx

      increasePriority = serverQueue.authors.get(message.author)
      //increasePriority++;
      increasePriority++;//double,because foreach will also decrease this by 1
      serverQueue.authors.set(message.author, increasePriority);
      console.log("got 2 here");
      schedule(serverQueue, song)//cannot read property get of undefined

      //decrease all authors prio by 1 lower bound to 0
      /*serverQueue.authors.forEach((value, key, map) => { 
        if(value!=0){value--;}
        
        map.set(key, value);
        console.log(map.get(key));
       } );*/
    } else {
      serverQueue.authors.set(message.author, 0);
      serverQueue.spotify.push(song);
      spotify(song);
    }
  }
}

function findLowestPriority(serverQueue){
  let authorsInMlfq = [];
  serverQueue.mlfq.forEach((element) => { 
    authorsInMlfq.push(element.author);
  } )
  let priority = 1000000000;
  serverQueue.authors.forEach((value, key) => { 
    if(authorsInMlfq.forEach((e) => {if(e == key){return true}})){ //do not know if foreach in if statement will work
      if(value < priority){
        priority = value
      }
    }
  } );
  return priority;//it might occur that no one with that priority is in the queue, solution, only test the priorities of people in the given mlfq
}

function skip(message, serverQueue) {
 //TODO
}

function deviceID(message, serverQueue) {
  const args = message.content.split(" ");
  device = args[1];
  console.log(device);
  message.channel.send(`You set the new device to the following ${device}`);
}

function schedule(serverQueue, song) {
  /*let priority = findLowestPriority(serverQueue);let index = serverQueue.mlfq.findIndex((e, ind, arr) => {serverQueue.authors.get(e) == priority;});let elem = serverQueue.mlfq[index];
    for(let i = index; i>0; i--){serverQueue.mlfq[i] = serverQueue.mlfq[i-1];serverQueue.mlfq[i-1] = elem;}serverQueue.mlfq.shift();play(serverQueue, elem);*/
  
   //shift queue by 1 (shift)
   serverQueue.mlfq.forEach(
    (arr, index, queue) => { 
      if(arr.length!=0){
      if(index==0){
        
        spotify(arr[0]);
        arr.shift();
      } else {
        queue[index-1].push(arr[0]);
        arr.shift();
      } }
    }
   );
  //place song in queue (push)
  if(serverQueue.authors.get(song.author)>=5){
    console.log("unlucky");
    serverQueue.mlfq[4].push(song)
    console.log(serverQueue.mlfq)
  }  else {
    console.log("better")
    serverQueue.mlfq[serverQueue.authors.get(song.author)-1].push(song)
    console.log(serverQueue.mlfq)
    //cannot read property get of undefined
  }
}

function play(serverQueue, song) {
  
  if (!song) {
    //No more song to queue
    return;
  }
}

function endOfQueue(serverQueue){
  if(currentlyPlaying()==serverQueue.spotify.pop().tackid){return true} else return false;
}

function currentlyPlaying(/* return track id */){}

function spotify(song) {
  //place the song in the spotify queue
  if(!song){return;}
  let header = "Accept: application/json Content-Type: application/json Authorization: Bearer BQA2qbCSWfjVIPQAZGmZVnj_mAUInvVzSVrF2rqS4AnYsva4AHzhvm55MmL1L5vn76FVYEsB2k2W2DC-5SYl4OKR7ufaV1mGElO6q52dcjwYMHPGomPjYM6qpXWVREB0_u0kLgsPmr1aBGg-mlGUFezX7swX1SmfNiVZkzLScPnLP9E80zYfgrsxmANz3j9gkXg08IQlR68I5HZy6uUk5ekEbix85DpxNiDMc2ysLiRd3VSr"
  let request = `https://api.spotify.com/v1/me/player/queue?uri=spotify%3Atrack%3A${song.tackid}&device_id=${device}`
}

client.login(token);