const helpers = require('../helpers');
const settings = helpers.Settings;
const Discord = require('discord.js-light');
const handler = require('./apply_handler.js');

module.exports = {
    name: 'apply',
    description: 'Starts the application process.',
    aliases: ['a']
}

module.exports.execute = async (msg, args, bot) => {
    let appChannel = bot.db.prepare('SELECT apply_channel_id as id FROM guilds WHERE id = ?').get(msg.guild.id);
    if(appChannel.id !== null && appChannel.id != msg.channel.id)
        return msg.channel.send(bot.misc.err + ' | Invalid channel. Apply in <#' + appChannel.id + '>!');

    let prefix = settings.prefix(msg.guild.id);
    let cancel = false;

    let dmembed = new Discord.MessageEmbed()
        .setColor(bot.config.color)
        .setTitle('New application for ' + msg.guild.name)
        .setDescription('Answer the following questions.')
        .setFooter('You can cancel the process anytime by writing ' + prefix + 'cancel.');

    let application = bot.db.prepare('INSERT INTO applications (user_id, guild_id, status) VALUES (?, ?, ?)').run(msg.author.id, msg.guild.id, 0);
    let applicationId = application.lastInsertRowid;
    let questions = bot.db.prepare('SELECT * FROM questions WHERE guild_id = ?').all(msg.guild.id);

    if(!questions.length)
        return msg.channel.send(bot.misc.err + ' | Well this is awkward. No questions have been set up.');

    msg.author.send(dmembed).then(async (newmsg) => {
        let embed = new Discord.MessageEmbed()
            .setColor(bot.config.color)
            .setAuthor(msg.member.user.tag, helpers.Avatar.get(msg.member.user))
            .setTitle('New application')
            .setDescription('Answer the question in your direct messages.');
        msg.channel.send(embed);

        var i = 1;
        for(q in questions) {
            if(cancel) break;

            let question = questions[q];
            let questionembed = new Discord.MessageEmbed()
                .setColor(bot.config.color)
                .setTitle('Question #' + i)
                .setDescription(question.question)
                .setFooter('You can cancel the process anytime by writing ' + prefix + 'cancel.');
            i++;

            await newmsg.channel.send(questionembed);
            await newmsg.channel.awaitMessages(m => m.content, { max: 1, time: 300000, errors: ["time"] })
                .then(async collected => {
                    let msgcontent = collected.first().content;
                    bot.db.prepare('INSERT INTO applications_answers (application_id, question_id, answer) VALUES (?, ?, ?)').run(applicationId, question.id, msgcontent);

                    if(msgcontent.toLowerCase() === prefix + 'cancel') {
                        newmsg.channel.send(bot.misc.err + ' | Application cancelled.');
                        handler.delete(applicationId, bot);
                        cancel = true;
                        return;
                    }
                }).catch(async () => {
                    newmsg.channel.send(bot.misc.err + ' | Application timed out.');
                    handler.delete(applicationId, bot);
                    cancel = true;
                    return;
                });
        }

        if(!cancel) {
            await newmsg.channel.send(bot.misc.ok + ' | Application finished.');
            await handler.finished(applicationId, msg, bot);
        }
    }).catch((error) => {
        let embed = new Discord.MessageEmbed()
            .setColor(bot.config.color)
            .setTitle('Application failed')
            .setDescription('It seems like I can\'t message you. Do you have direct messages disabled?');
        msg.channel.send(embed);
    });
}
