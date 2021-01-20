const helpers = require('../helpers');
const Discord = require('discord.js-light');

module.exports = {
    name: 'apply_handler',
    description: 'Handler for various apply command tasks.',
    delete(applicationId, bot) {
        bot.db.prepare('DELETE FROM applications_answers WHERE application_id = ?').run(applicationId);
        bot.db.prepare('DELETE FROM applications WHERE id = ?').run(applicationId);
    },
    deleteByUser(userId, bot) {
        let applications = bot.db.prepare('SELECT * FROM applications WHERE user_id = ?').all(userId);
        for(a in applications) {
            let app = applications[a];
            bot.db.prepare('DELETE FROM applications_answers WHERE application_id = ?').run(app.id);
            bot.db.prepare('DELETE FROM applications WHERE id = ?').run(app.id);
        }
    },
    finished(applicationId, msg, bot) {
        bot.db.prepare('UPDATE applications SET status = 1 WHERE id = ?').run(applicationId);

        let answers = bot.db.prepare('SELECT * FROM applications_answers WHERE application_id = ?').all(applicationId);
        let logChannel = bot.db.prepare('SELECT CAST(log_channel_id as TEXT) as log_channel_id FROM guilds WHERE id = ?').get(msg.guild.id);

        let embed = new Discord.MessageEmbed()
            .setColor(bot.config.color)
            .setTitle('New application')
            .setAuthor(msg.member.user.tag, helpers.Avatar.get(msg.member.user))
            .setTimestamp();

        for(a in answers) {
            let answer = answers[a];
            let question = bot.db.prepare('SELECT * FROM questions WHERE id = ?').get(answer.question_id);
            embed.addField(question.question, answer.answer, true);
        }

        if(logChannel.log_channel_id !== null) {
            var channel = bot.channels.cache.get(logChannel.log_channel_id);
        } else {
            var channel = msg.guild.channels.cache.find(channel => channel.type === 'text' && channel.permissionsFor(msg.guild.me).has('SEND_MESSAGES'));
        }
        channel.send(embed);
    }
}
