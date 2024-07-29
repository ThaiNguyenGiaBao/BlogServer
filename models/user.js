const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "https://firebasestorage.googleapis.com/v0/b/blog-f3876.appspot.com/o/1721822691465de.jpg?alt=media&token=527c7ec9-a533-4a31-baf1-f23e8aedc8ab",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
  
);

module.exports = mongoose.model("User", userSchema);
