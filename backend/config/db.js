const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ FATAL END ERROR: MONGO_URI is not defined in environment variables.');
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Check for IP whitelist error typical in Atlas
    if (error.message.includes('bad auth') || error.message.includes('auth failed')) {
      console.error('👉 Hint: Check if your MongoDB username and password are correct in MONGO_URI.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEOUT')) {
      console.error('👉 Hint: Check if your MongoDB Atlas IP Access List allows connections from Render (allow 0.0.0.0/0).');
    }
    setTimeout(connectDB, 10000);
  }
};

module.exports = connectDB;
