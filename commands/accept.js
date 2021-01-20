const helpers = require('../helpers');
const Discord = require('discord.js-light');
const handler = require('./apply_handler.js');

module.exports = {
    name: 'accept',
    description: 'Accept a member.',
    aliases: ['acc']
}

module.exports.execute = async(msg, args, bot) => {
    if(!helpers.Validation.canReview(msg, bot.db))
        return msg.channel.send(bot.misc.err + ' | Missing application review permissions.');

    var acceptReason = args.slice(1).join(' ').trim();
    if(msg.mentions.users.first()) {
        var user = msg.mentions.users.first();
    } else if(args[0]) {
        var user = bot.users.cache.find(u => u.tag.toLowerCase() == args[0].trim().toLowerCase());
        if(user === undefined) {
            let argsSplit = args.join(' ').split('#');
            if(argsSplit.length >= 2) {
                acceptReason = argsSplit[1].substring(5); // Remove #0001 + space.
                let tag = argsSplit[0] + '#' + argsSplit[1].substring(0, 4);
                var user = bot.users.cache.find(u => u.tag.toLowerCase() == tag.toLowerCase());
            }
        }
    }

    if(user === undefined)
        return msg.channel.send(bot.misc.err + ' | Mention a user to accept.');

    let application = bot.db.prepare('SELECT * FROM applications WHERE user_id = ? AND guild_id = ?').all(user.id, msg.guild.id);

    if(application === undefined || application.length == 0)
        return msg.channel.send(bot.misc.err + ' | No active applications by this user.');

    let embedDMDescription = 'Your application for ' + msg.guild.name + ' was accepted.';
    if(acceptReason != '') embedDMDescription += '\nMessage from the server: ' + acceptReason
    let embedDM = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle(bot.misc.ok + ' | Application accepted')
        .setDescription(embedDMDescription)
        .setTimestamp();

    let embed = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle(bot.misc.ok + ' | User accepted')
        .setDescription(user.tag + ' was accepted.')
        .setTimestamp();

    user.send(embedDM);
    msg.channel.send(embed);
    handler.deleteByUser(user.id, bot);

    msg.reply('do you want to give a role to the accepted user? Mention it or write it\'s name.');

    let err = bot.misc.err + ' | No roles will be given to <@' + user.id + '>.';
    let filter = m => m.author.id === msg.author.id;

    msg.channel.awaitMessages(filter, { max: 1, time: 15000 }).then((m) => {
        let content = m.first().content;
        if(content.toLowerCase() == 'no' || content.toLowerCase() == 'nah') {
            msg.channel.send(err);
        } else {
            let role = undefined;
            if(content.includes('<@&')) {
                let id = content.replace(/\D/g,'');
                if(!id.length) return false;
                role = msg.guild.roles.cache.get(id);
            } else {
                role = msg.guild.roles.cache.find(r => r.name === content.trim());
            }
            if(role === undefined) {
                msg.channel.send(err);
            } else {
                let member = msg.guild.members.cache.find(m => m.id === user.id);
                member.roles.add(role).then(() => {
                    msg.channel.send(bot.misc.ok + ' | Role `' + role.name + '` has been given to <@' + user.id + '>.');
                }).catch(() => {
                    msg.channel.send(bot.misc.err + ' | Well this is awkward. I do not have permissions to give that role to others.');
                });
            }
        }
    });
}
