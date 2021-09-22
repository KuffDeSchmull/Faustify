# fausti-bot
**Warning** Although version 16 is needed for discord.js v13, this version will break the ytdl-core lib.

Currently work is being done to push a version for NodeJS 14 and DiscordJS 12, not all migrations are ready yet. You can try and run index16.js with the discordjs version in package.json set to 13.1.0 and NodeJS 16, but eventually your connection will break.

Before you start, you need to set a command prefix and your discord bot token in the config.json
#### config.json
```javascript
{
    "prefix": "!",
    "token": "your-token",
    "yt-api": ""
}

```

Please refer to [this guide](https://discordpy.readthedocs.io/en/stable/discord.html) on how to register a discord bot and get your token 

