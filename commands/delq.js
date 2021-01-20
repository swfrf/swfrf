const helpers = require('../helpers');
const Discord = require('discord.js');

module.exports = {
    name: 'delq',
    description: 'Delete a question.',
    permissions: ['ADMINISTRATOR'],
    aliases: []
}

module.exports.execute = async(msg, args, bot) => {
    let query = args.join(' ').trim();
    if(!query.length)
        return msg.channel.send(bot.misc.err + ' | Specify a question or question ID to be deleted.');

    if(helpers.Validation.isNumeric(query)) {
        var question = bot.db.prepare('SELECT * FROM questions WHERE id = ? AND guild_id = ?').get(query, msg.guild.id);
        if(question === undefined)
            return msg.channel.send(bot.misc.err + ' | No questions found with ID #' + query + '.');
    } else {
        var question = bot.db.prepare("SELECT * FROM questions WHERE question LIKE (? || '%') AND guild_id = ?").all(query, msg.guild.id);
        if(!question.length)
            return msg.channel.send(bot.misc.err + ' | No questions found for `' + query + '`.');
    }

    if(Array.isArray(question)) {
        if(question.length > 1) {
            let embed = new Discord.MessageEmbed()
                .setColor(bot.config.color)
                .setTitle('Multiple questions found for query')
                .setDescription('Try using IDs to delete questions.')
            for(q in questions) {
                embed.addField(questions[q].question, '`ID: ' + questions[q].id + '`');
            }
            return msg.channel.send(embed);
        } else {
            question = question[0];
        }
    }

    bot.db.prepare('DELETE FROM applications_answers WHERE question_id = ?').run(question.id);
    bot.db.prepare('DELETE FROM questions WHERE id = ?').run(question.id);

    msg.channel.send(bot.misc.ok + ' | Question `' + question.question + '` deleted.');
}
