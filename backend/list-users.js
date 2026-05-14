const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();
async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petify');
    const users = await User.find({}, 'name email isAdmin createdAt');
    if (!users.length) { console.log('No users found in DB.'); process.exit(0); }
    users.forEach(u => console.log(`${u.isAdmin ? '👑 ADMIN' : '👤 User '} | ${u.email} | ${u.name}`));
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
