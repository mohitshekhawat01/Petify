
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'shekhawatrajput456@gmail.com';
    const user = await User.findOne({ email });
    if (!user) {
        console.error(`❌ No user found with email: ${email}`);
        process.exit(1);
    }
    user.password = '12345678';  // will be hashed by pre-save hook
    user.isAdmin = true;
    await user.save();
    console.log(`✅ Password updated and admin flag set for ${user.name} (${email})`);
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
