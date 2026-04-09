require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const user = await User.findOne({});
  console.log("Current user social links:", user.socialLinks);

  // Directly update
  user.socialLinks.instagram = 'https://instagram.com/test';
  user.socialLinks.discord = 'https://discord.gg/test';
  user.markModified('socialLinks');
  await user.save();

  const verify = await User.findById(user._id);
  console.log("Verified save:", verify.socialLinks);

  process.exit(0);
};
testDB();
