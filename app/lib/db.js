import mongoose from "mongoose";

export const MONGO_URI="mongodb+srv://sohail2001:mMT58X679SWipbik@cluster0.sc3io.mongodb.net/uptown_database?retryWrites=true&w=majority&appName=Cluster0"

export default async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(MONGO_URI);
  }