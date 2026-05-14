const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const email = process.argv[2];
const newPassword = process.argv[3];
if (!email || !newPassword) { console.error('Usage: node reset-password.js <email> <newpassword>'); process.exit(1); }

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/petify');
    const User = require('./models/User');
    const user = await User.findOne({ email });
    if (!user) { console.error('❌ User not found'); process.exit(1); }
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    user.save = user.constructor.prototype.save; // bypass pre-save hook
    await mongoose.connection.collection('users').updateOne({ _id: user._id }, { $set: { password: user.password } });
    console.log(`✅ Password reset for ${email}`);
    process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
