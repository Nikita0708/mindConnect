import mongoose from "mongoose";
import app from './app.js';

const {dbUrlMongoDB, PORT} = process.env;

mongoose
  .connect(dbUrlMongoDB)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log(`Server running. Use your API on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });