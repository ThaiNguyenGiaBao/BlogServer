const express = require("express");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const commentRoute = require("./routes/comment");
const post = require("./routes/post");
const cookies = require("cookie-parser");
const cors = require("cors");
const User = require("./models/user");

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Allow to server to accept request from different origin
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
  })
); // Use this after the variable declaration
app.use(cookies());

mongoose.connect(process.env.DATABASE_URL, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

app.use("/", authRoute);
app.use("/user", userRoute);
app.use("/post", post);
app.use("/comment", commentRoute);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
