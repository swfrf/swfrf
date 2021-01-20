const helpers = require('../helpers');
const settings = helpers.Settings;

module.exports = {
    name: 'prefix',
    description: 'Set bot prefix.',
    permissions: ['ADMINISTRATOR'],
    aliases: []
}

module.exports.execute = async(msg, args, bot) => {
    let prefix = args.join(' ');
    if(!prefix.length)
        return msg.channel.send('My prefix for this guild is `' + settings.prefix(msg.guild.id) + '`');

    if(prefix.length > 5) return msg.channel.send(bot.misc.err + ' | Prefix can\'t be longer than 5 characters.');

    bot.db.prepare('UPDATE guilds SET prefix = ? WHERE id = ?').run(prefix, msg.guild.id);
    msg.channel.send(bot.misc.ok + ' | Prefix changed to `' + prefix + '`.');
}
