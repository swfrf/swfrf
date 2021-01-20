const Discord = require('discord.js-light');

module.exports = {
    name: 'info',
    description: 'Bot info',
    aliases: ['about']
}

module.exports.execute = async(msg, args, bot) => {
    let ping = Date.now() - msg.createdTimestamp;
    let embed = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle(bot.user.username)
        .setThumbnail(bot.user.displayAvatarURL())
        .setDescription('Simple yet powerful application bot for your servers.')
        .addFields(
            { name: 'Features', value: 'Customizable questions (add, delete, show).\nSelectable application & application log channels.\nCustomizable reviewer role.' },
            { name: 'Guilds', value: bot.guilds.cache.size, inline: true },
            { name: 'Users', value: bot.guilds.cache.reduce((a, g) => a + g.memberCount, 0), inline: true },
            { name: 'Ping', value: ping + ' ms', inline: true },
            { name: 'Library', value: 'Discord.js Light', inline: true },
            { name: 'Creator', value: 'Defected#0001', inline: true },
        );
    msg.channel.send(embed);
}
