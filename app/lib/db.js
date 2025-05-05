import mongoose from "mongoose";

export const MONGO_URI="mongodb+srv://mohammdsohail424:8gJ7WSOKEjHjv1rA@cluster0.a2jqc.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

const dbConnection = {
  isConnected: false,
};

async function connectDB() {
  if (dbConnection.isConnected) {
    console.log("MongoDB is already connected");
    return mongoose.connection; // Return existing connection
  }

  try {
    const db = await mongoose.connect(MONGO_URI);
    dbConnection.isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
    return db.connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export default connectDB;