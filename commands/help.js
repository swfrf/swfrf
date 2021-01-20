const helpers = require('../helpers');
const settings = helpers.Settings;
const Discord = require('discord.js-light');

module.exports = {
    name: 'help',
    description: 'Shows help embed',
    aliases: ['bot', 'commands']
}

module.exports.execute = async(msg, args, bot) => {
    let prefix = settings.prefix(msg.guild.id);
    let embed = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle('Help')
        .setFooter(bot.misc.credits)
        .addFields(
            { name: 'Apply', value: '`' + prefix + 'apply` - initialize application process.' },
            { name: 'Review', value: '`' + prefix + 'accept <name> <message>` - accept a user.\n`' + prefix + 'reject <name> <message>` - reject a user.' },
            { name: 'Questions', value: '`' + prefix + 'questions` - list questions.\n`' + prefix + 'addq <text>` - add a question.\n`' + prefix + 'delq <name/id>` - delete a question.' },
            { name: 'Channels', value: '`' + prefix + 'appchannel <channel>` - set an application channel (use `none` to remove).\n`' + prefix + 'logchannel <channel>` - set a log channel (use `none` to remove).' },
            { name: 'Config', value: '`' + prefix + 'reviewer <role>` - set a reviewer role (use `none` to remove).\n`' + prefix + 'prefix <text>` - set a new prefix.' },
            { name: 'Misc', value: '`' + prefix + 'info` - information about the bot.\n`' + prefix + 'ping` - useless bot latency.' },
        );
    msg.channel.send(embed);
}
