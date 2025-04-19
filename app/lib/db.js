import mongoose from "mongoose";

export const MONGO_URI="mongodb+srv://mohammdsohail424:8gJ7WSOKEjHjv1rA@cluster0.a2jqc.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"

export default async function connectDB() {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(MONGO_URI);
  }