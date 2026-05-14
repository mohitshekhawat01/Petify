/**
 * make-admin.js
 * Run: node make-admin.js your@email.com
 * This makes the user with that email an admin.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const email = process.argv[2];
if (!email) {
    console.error('Usage: node make-admin.js <email>');
    process.exit(1);
}

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petify');
    const user = await User.findOne({ email });
    if (!user) {
        console.error(`❌ No user found with email: ${email}`);
        process.exit(1);
    }
    user.isAdmin = true;
    await user.save();
    console.log(`✅ ${user.name} (${email}) is now an admin!`);
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
