module.exports = {
    name: 'addq',
    description: 'Add a question.',
    permissions: ['ADMINISTRATOR'],
    aliases: []
}

module.exports.execute = async(msg, args, bot) => {
    let question = args.join(' ').trim();
    if(!question.length)
        return msg.channel.send(bot.misc.err + ' | Question can\'t be empty.');
    if(question.length < 3)
        return msg.channel.send(bot.misc.err + ' | Question should be at least 3 characters long.');
    if(question.length > 255)
        return msg.channel.send(bot.misc.err + ' | Question should be under 255 characters long.');

    bot.db.prepare('INSERT INTO questions (guild_id, question) VALUES(?, ?)').run(msg.guild.id, question);

    msg.channel.send(bot.misc.ok + ' | Question `' + question + '` added.');
}
