const express = require("express");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const commentRoute = require("./routes/comment");
const post = require("./routes/post");
const cookies = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const PORT = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(cors()); // Use this after the variable declaration
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

app.listen(PORT, () => {
  console.log("Server is running on port" + PORT);
});
