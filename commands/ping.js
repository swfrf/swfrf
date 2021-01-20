const Discord = require('discord.js-light');

module.exports = {
    name: 'ping',
    description: 'U S E L E S S',
    aliases: ['latency'],
}

module.exports.execute = async(msg, args, bot) => {
    let ping = Date.now() - msg.createdTimestamp;
    let embed = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setDescription('**Ping:** ' + ping + ' ms')
        .setFooter('this doesnt mean anything really');
    msg.channel.send(embed);
}
