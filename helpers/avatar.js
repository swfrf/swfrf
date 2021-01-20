const configuration = require('../config.json');
const servers = configuration.servers;
const base_url = process.env.BASE;

module.exports = {
    name: 'avatar',
    description: 'Get avatar of a user.',
    get(user) {
        return "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png";
    }
}
