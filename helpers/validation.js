module.exports = {
    name: 'validation',
    description: 'Various validation commands.',
    canReview(msg, db) {
        let reviewer = db.prepare('SELECT role_id FROM reviewers WHERE guild_id = ?').get(msg.guild.id);

        if(reviewer == undefined || reviewer.role_id === null) return msg.member.hasPermission('MANAGE_MESSAGES');

        return msg.member.roles.cache.find(r => r.id == reviewer.role_id);
    },
    isNumeric(value) {
        return /^\d+$/.test(value);
    }
}
