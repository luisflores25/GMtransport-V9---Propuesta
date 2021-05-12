const bcrypt = require('bcryptjs');
const User = require('../users/user');
const Role = require('./role');

module.exports = createTestUser;

async function createTestUser() {
    // create test user if the db is empty
    if ((await User.countDocuments({})) === 0) {
        const user = new User({
            empresa: 'GMTPSV9T',
            usuario: 'luisflores',
            password: bcrypt.hashSync('123456', 10),
            role: Role.Admin
        });
        await user.save();
    }
}