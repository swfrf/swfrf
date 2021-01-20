const helpers = require('../helpers');
const Discord = require('discord.js-light');
const handler = require('./apply_handler.js');

module.exports = {
    name: 'reject',
    description: 'Reject a member.',
    aliases: ['rej']
}

module.exports.execute = async(msg, args, bot) => {
    if(!helpers.Validation.canReview(msg, bot.db))
        return msg.channel.send(bot.misc.err + ' | Missing application review permissions.');

    var rejectReason = args.slice(1).join(' ').trim();
    if(msg.mentions.users.first()) {
        var user = msg.mentions.users.first();
    } else if(args[0]) {
        var user = bot.users.cache.find(u => u.tag.toLowerCase() == args[0].trim().toLowerCase());
        if(user === undefined) {
            let argsSplit = args.join(' ').split('#');
            if(argsSplit.length >= 2) {
                rejectReason = argsSplit[1].substring(5); // Remove #0001 + space.
                let tag = argsSplit[0] + '#' + argsSplit[1].substring(0, 4);
                var user = bot.users.cache.find(u => u.tag.toLowerCase() == tag.toLowerCase());
            }
        }
    }

    if(user === undefined)
        return msg.channel.send(bot.misc.err + ' | Mention a user to reject.');

    let application = bot.db.prepare('SELECT * FROM applications WHERE user_id = ? AND guild_id = ?').all(user.id, msg.guild.id);

    if(application === undefined || application.length == 0)
        return msg.channel.send(bot.misc.err + ' | No active applications by this user.');

    let embedDMDescription = 'Your application for ' + msg.guild.name + ' was rejected.';
    if(rejectReason != '') embedDMDescription += '\nMessage from the server: ' + rejectReason;
    let embedDM = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle(bot.misc.err + ' | Application rejected')
        .setDescription(embedDMDescription)
        .setTimestamp();

    let embed = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle(bot.misc.err + ' | User rejected')
        .setDescription(user.tag + ' was rejected.')
        .setTimestamp();

    user.send(embedDM);
    msg.channel.send(embed);
    handler.deleteByUser(user.id, bot.db);
}
