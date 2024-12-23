import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  try {
    const connect = await mongoose.connect(MONGODB_URI);
    console.log("Successfully CONNECTED to ARABIC_LEARNING DB");
  } catch (error) {
    console.log(`Connection to ARABIC_LEARNING DB FAILED!!!`, error?.message);
    process.exit(1); // 1 is failure, 0 is success
  }
};
