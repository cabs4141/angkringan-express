import mongoose from "mongoose";

const databaseConnection = async () => {
  try {
    let connection = process.env.DATABASE_URL;
    connection = await mongoose.connect(connection);
    if (!connection) {
      throw new Error("cannot connect to database 💤");
    }
    console.log("API ON 🔥🔥🔥");
  } catch (error) {
    throw new Error(error);
  }
};

export default databaseConnection;
