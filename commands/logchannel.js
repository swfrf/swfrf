module.exports = {
    name: 'logchannel',
    description: 'Set log channel.',
    permissions: ['ADMINISTRATOR'],
    aliases: ['logc']
}

module.exports.execute = async(msg, args, bot) => {
    let current = bot.db.prepare('SELECT log_channel_id FROM guilds WHERE id = ?').get(msg.guild.id);
    if(!args[0]) {
        let id = (current !== undefined) ? current.log_channel_id : null;
        let err = (id !== null) ? 'Current log channel is <#' + id + '>.' : 'Log channel is not set up, applications are sent to first text channel I can send messages to.';
        return msg.channel.send(err);
    }

    let err = bot.misc.err + ' | Specify a channel by tagging it.';
    let id = args[0].trim();
    let name = '';
    let channel;
    if(id == 'none') {
        id = null;
        name = 'none. Applications are sent to first text channel I can send messages to.';
    } else {
        id = id.replace(/\D/g,'');
        if(!id.length) return msg.channel.send(err);

        channel = msg.guild.channels.cache.get(id);
        if(!channel || channel.type != 'text') return msg.channel.send(err);

        name = '<#' + id + '>';
    }

    bot.db.prepare('UPDATE guilds SET log_channel_id = ? WHERE id = ?').run(id, msg.guild.id);
    msg.channel.send(bot.misc.ok + ' | Log channel changed to ' + name + '.');

    if(!channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES') || !channel.permissionsFor(msg.guild.me).has('EMBED_LINKS')) {
        msg.channel.send(bot.misc.err + ' | Make sure to give me `Send Messages` and `Embed Links` permissions.');
    }
}
