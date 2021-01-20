/* External includes. */
const Discord = require('discord.js-light');
const sql = require('better-sqlite3');

/* Defines. */
const bot =  new Discord.Client({
    cacheGuilds: true,
    cacheChannels: true,
    cacheOverwrites: false,
    cacheRoles: true,
    cacheEmojis: false,
    cachePresences: false
});
const helpers = require('./helpers');
const settings = helpers.Settings;
const config = settings.config();
const db = new sql('./db/applybot.db');

/* Command handler. */
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
const botCommands = require('./commands');
Object.keys(botCommands).map(key => {
    let cmd = botCommands[key];
    bot.commands.set(cmd.name, cmd);
    for(let alias of cmd.aliases) bot.aliases.set(alias, cmd);
});

/* Bot vars. */
bot.config = config;
bot.db = db;
bot.misc = {
    credits: 'Your text here.',
    ok: '<:applybot_ok:753989832652357712>',
    err: '<:applybot_err:753989832702820422>'
}

/* Init bot. */
bot.login(config.token);
bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
    bot.user.setActivity('your applications.', { type: 'WATCHING' });
});

/* Join a guild. */
bot.on('guildCreate', (guild) => {
    let exists = db.prepare('SELECT id FROM guilds WHERE id = ?').get(guild.id);
    if(exists !== undefined && exists.length) return;

    db.prepare('INSERT INTO guilds (id, prefix) VALUES (?, ?)').run(guild.id, config.default_prefix);

    let p = config.default_prefix;
    let embed = new Discord.MessageEmbed()
        .setColor(config.color)
        .setTitle('ApplyBot is here!')
        .setDescription('<:applybot_ok:753989832652357712> Welcome to ApplyBot v1.0.\n\nHere are some commands you\'ll need to set me up.')
        .addFields(
            { name: 'Add a question', value: '`' + p + 'addq <text>`' },
            { name: 'Set application channel', value: '`' + p + 'appchannel <channel>` - if application channel is not set, users can apply anywhere.' },
            { name: 'Set log channel', value: '`' + p + 'logchannel <channel>` - if log channel is not set, applications are sent to first text channel I can send messages to.' },
            { name: 'Set reviewer role', value: '`' + p + 'reviewer <role>` - set a reviewer role.' },
            { name: 'See more', value: '`' + p + 'help`' },
        )
        .setFooter('Defected#0001 - www.defected.dev');
    let channel = guild.channels.cache.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));

    setTimeout(function() { // Wait some time to get a default role and access to some channels.
        channel.send(embed);
    }, 1500);
});

/* Leave a guild. */
bot.on('guildDelete', (guild) => {
    let applications = db.prepare('SELECT * FROM applications WHERE guild_id = ?').all(guild.id);
    for(a in applications) {
        let app = applications[a];
        db.prepare('DELETE FROM applications_answers WHERE application_id = ?').run(app.id);
        db.prepare('DELETE FROM applications WHERE id = ?').run(app.id);
    }
    db.prepare('DELETE FROM questions WHERE guild_id = ?').run(guild.id);
    db.prepare('DELETE FROM reviewers WHERE guild_id = ?').run(guild.id);
    db.prepare('DELETE FROM guilds WHERE id = ?').run(guild.id);
});

/* Watch for messages. */
bot.on('message', (msg) => {
    if(msg.author.bot || msg.guild === null) return;
    let prefix = settings.prefix(msg.guild.id);
    if(!msg.content.startsWith(prefix)) return;

    let args = msg.content.slice(prefix.length).split(' ');
    let cmd = args.shift().toLowerCase();

    if(bot.commands.has(cmd)) var cmdFile = bot.commands.get(cmd);
    else if(bot.aliases.has(cmd)) var cmdFile = bot.aliases.get(cmd);
    else return;

    if(cmdFile.ownerOnly && !bot.config.owners.includes(msg.author.id)) return;
    if(cmdFile.permissions && !(bot.config.owners.includes(msg.author.id) || msg.member.permissions.has(cmdFile.permissions)))
        return msg.channel.send('<:applybot_err:753989832702820422> | Missing permissions (`' + cmdFile.permissions.join(", ") + '`).');

    try {
        cmdFile.execute(msg, args, bot);
    } catch(error) {
        msg.channel.send('Oof! `' + error + '`');
    }
});

/* Watch for mention. */
bot.on('message', (msg) => {
    if(msg.author.bot || msg.guild === null) return;

    let prefix = settings.prefix(msg.guild.id);
    let content = msg.content.trim();
    if(!msg.content.startsWith('<@' + bot.user.id + '>') && !msg.content.startsWith('<@!' + bot.user.id + '>')) return;

    let embed = new Discord.MessageEmbed()
        .setColor(config.color)
        .setTitle('ApplyBot')
        .setDescription('My prefix for this guild is `' + prefix + '`.\nUse `' + prefix + 'help` to view my commands.')
        .setFooter(bot.misc.credits);
    msg.channel.send(embed);
});
