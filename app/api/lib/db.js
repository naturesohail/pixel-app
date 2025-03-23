import mongoose from "mongoose";

export const MONGO_URI="mongodb+srv://mohammadsohail424:xrQ7mEtyjQpMp044@cluster0.a2jqc.mongodb.net/test_database?retryWrites=true&w=majority&appName=Cluster0"

export default async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(MONGO_URI);
  }