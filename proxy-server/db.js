const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();


let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB already connected');
    return;
  }

  try {
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/query_logs';
    
    await mongoose.connect(mongoUrl);
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};


const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected');
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected: () => isConnected
};
