const helpers = require('../helpers');
const settings = helpers.Settings;
const Discord = require('discord.js-light');

module.exports = {
    name: 'questions',
    description: 'Get questions.',
    aliases: ['q']
}

module.exports.execute = async(msg, args, bot) => {
    let prefix = settings.prefix(msg.guild.id);
    let questions = bot.db.prepare('SELECT * FROM questions WHERE guild_id = ?').all(msg.guild.id);

    let embed = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle('Questions (' + questions.length + ')')
        .setFooter('Tip: Use ' + prefix + 'addq to add a question.');

    let description = '';
    let count = 1;
    for(q in questions) {
        let question = questions[q];
        description += '**' + count + ')** ' + question.question + ' `(ID: ' + question.id + ')`\n';
        count++;
    }

    embed.setDescription(description);

    msg.channel.send(embed);
}
