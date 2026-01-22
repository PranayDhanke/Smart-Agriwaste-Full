import mongoose from "mongoose";

const mongo_uri = process.env.MONGO_URI as string;

if (!mongo_uri) {
  console.log("MongoDB URI is not defined");
  process.exit(1);
}

export const mongoConnect = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(mongo_uri);
    console.log("MongoDB connected");
  } catch {
    console.log("Error connecting to MongoDB");
    process.exit(1);
  }
};
