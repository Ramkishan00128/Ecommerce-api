import app from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./config/db.js";

config({
  path: "./config/.env",
});
connectDB();
app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
