import express from "express";
import bodyParser from "body-parser";
import ErrorMiddlerware from "./middleware/Error.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Ecommerce Endpoint");
});

import getUser from "./routes/userRoute.js";
import Product from "./routes/productRoute.js";
app.use("/api/v1", getUser);
app.use("/api/v1", Product);

export default app;

app.use(ErrorMiddlerware);
