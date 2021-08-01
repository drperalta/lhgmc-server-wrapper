const { Client, MessageEmbed, MessageManager } = require('discord.js');
const minecraftServerUtil = require('minecraft-server-util');
const ScriptServer = require('scriptserver');

const { getFormattedTime } = require('./utils');

// VARIABLES
const NOTIF_CHANNEL = '871052950527692830';
const CHAT_CHANNEL = '871054344458473503';

// INSTANCES
const discordClient = new Client();

const minecraftServer = new ScriptServer({
    core: {
        jar: 'forge-1.16.5-36.1.65.jar',
        args: ['-d64', '-server', '-XX:+AggressiveOpts', '-XX:+UseConcMarkSweepGC', '-XX:+UnlockExperimentalVMOptions', '-XX:+UseParNewGC', '-XX:+ExplicitGCInvokesConcurrent', '-XX:+UseFastAccessorMethods'],
        rcon: {
            host: '0.0.0.0',
            port: '25575',
            password: '0000000000'
        },
        flavorSpecific: {
            default: {
                rconRunning: /RCON running on 0\.0\.0\.0:25575/,
            },
        },
    },
    command: {
        prefix: '~'
    }
});

minecraftServer.use(require('scriptserver-event'));


// HELPER FUNCTIONS
const serverStatus = async () => {
    try {
        const data = await minecraftServerUtil.status('127.0.0.1');
        return data;
    } catch (error) {
        return null
    }
}

const discordSendMessage = (type, message) => {
    if (type === 'chat') {
        discordClient.channels.cache.get(CHAT_CHANNEL).send(message);
    }

    if (type === 'notif') {
        discordClient.channels.cache.get(NOTIF_CHANNEL).send(message);
    }
}

const removeAllMessage = async () => {
    const messageManager = new MessageManager(discordClient.channels.cache.get(CHAT_CHANNEL));

    messageManager.channel.bulkDelete(100);
    messageManager.channel.bulkDelete(100);
    messageManager.channel.bulkDelete(100);
    messageManager.channel.bulkDelete(100);
    messageManager.channel.bulkDelete(100);
}

// SERVER AND CLIENT EVENTS
discordClient.once('ready', async () => {
    console.log('LHG Minecraft Bot is now Online');
});

/**
 *  This will handle all user chat from discord
 */
discordClient.on('message', async (message) => {
    if (message.content === '/playerlist') {
        serverStatus().then(data => {
            if (!data) return;

            let playerList = 'There are no online players';
            let playerCount = 0;

            if (data.onlinePlayers > 0) {
                const players = data.samplePlayers.map(({ name }) => name);
                playerList = players.join(', ');
                playerCount = data.onlinePlayers;
            }

            const embed = new MessageEmbed();

            embed
                .setColor(2123412)
                .addField('ᴏɴʟɪɴᴇ ᴘʟᴀʏᴇʀꜱ', playerList)
                .setFooter(`${playerCount} of 15 players are online`)

            message.channel.send(embed);
        });
    }

    if (message.channel.id === CHAT_CHANNEL) {
        if (!message.author.bot) {
            minecraftServer.send(`tellraw @a "§9[${message.author.username}]§f ${message.content}"`);
        }
    }
});

/**
 *  This will handle all player chat from minecraft
 */
minecraftServer.on('chat', ({ player, message, timestamp}) => {
    const embed = new MessageEmbed();

    embed
        .setColor(0x2F3136)
        .addField(player, message)
        .setFooter(getFormattedTime(timestamp))

    discordSendMessage('chat', embed);
});

minecraftServer.on('start', async event => {
    
    const embed = new MessageEmbed();

    embed
        .setTitle('Server is Up')
        .setDescription('You can now connect to Minecraft Server')
        .setColor(5763719)
        .setFooter('IP: play-tunnel.lhgmc.xyz')
    discordSendMessage('notif', embed)
});

minecraftServer.on('stop', event => {
    removeAllMessage();

    const embed = new MessageEmbed();

    embed
        .setTitle('Server is Down')
        .setDescription('Server is temporarily down. see you later')
        .setColor(15548997)
        .setFooter('IP: play-tunnel.lhgmc.xyz')
    discordSendMessage('notif', embed)
});

minecraftServer.on('login', ({ player }) => {
    const embed = new MessageEmbed();

    embed
        .setTitle(`\`${player}\` joined the game`)
        .setColor(5763719)
    discordSendMessage('notif', embed)
})

minecraftServer.on('logout', ({ player }) => {
    const embed = new MessageEmbed();

    embed
        .setTitle(`\`${player}\` disconnected`)
        .setColor(15548997)
    discordSendMessage('notif', embed)
})


discordClient.login('ODY4ODc3NzcyNDAyMDgxODEy.YP2Dew.jT692qkHkkK3SUBuWIx1kzQGkF8');

minecraftServer.start();
