module.exports = {
    name: 'reviewer',
    description: 'Set a reviewer role.',
    permissions: ['ADMINISTRATOR'],
    aliases: []
}

module.exports.execute = async(msg, args, bot) => {
    let current = bot.db.prepare('SELECT role_id FROM reviewers WHERE guild_id = ?').get(msg.guild.id);
    if(!args[0]) {
        let id = (current !== undefined) ? current.role_id : null;
        let err = (id !== null) ? 'Current reviewer role is <@&' + id + '>.' : 'Reviewer role is not set up, users with `ADMINISTRATOR` permission can review applications.';
        return msg.channel.send(err);
    }

    let err = bot.misc.err + ' | Specify a valid role.';
    let id = args[0].trim();
    let name = '';
    if(id == 'none') {
        id = null;
        name = 'none. Users with `ADMINISTRATOR` permission can review applications.';
    } else {
        id = id.replace(/\D/g,'');
        if(!id.length) return msg.channel.send(err);

        let role = msg.guild.roles.cache.get(id);
        if(!role) return msg.channel.send(err);

        name = '<@&' + id + '>';
    }

    if(current !== undefined) {
        bot.db.prepare('UPDATE reviewers SET role_id = ? WHERE guild_id = ?').run(id, msg.guild.id);
    } else {
        bot.db.prepare('INSERT INTO reviewers (role_id, guild_id) VALUES(?, ?)').run(id, msg.guild.id);
    }

    msg.channel.send(bot.misc.ok + ' | Reviewers role changed to ' + name + '.');
}
