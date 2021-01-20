const configjson = require('../config.json');
const sql = require('better-sqlite3');
const db = new sql('./db/applybot.db');
const request = require('request');

module.exports = {
    name: 'settings',
    description: 'Get bot settings.',
    config() {
        return configjson;
    },
    prefix(id) {
        let guild = db.prepare('SELECT prefix FROM guilds WHERE id = ?').get(id);
        return guild.prefix;
    }
}
