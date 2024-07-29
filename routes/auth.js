const express = require("express");
const bcrypt = require("bcrypt");

const route = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

route.post("/signup", async (req, res) => {
  const users = await User.find();
  let check = users.find((user) => user.email == req.body.email);
  if (check) {
    return res.send("User already exists");
  }
  try {
    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
    });

    await newUser.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(500).json(error);
  }
});

route.post("/signin", async (req, res) => {
  const users = await User.find();

  if (users.length == 0) {
    return res.send("User not found");
  }
  const user = users.find((user) => user.email === req.body.email);

  if (user == null) {
    return res.send("User not found");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
      const { password: pass, ...others } = user._doc;
      others.token = token;
      //console.log(others);
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(others);
    } else {
      res.send("Incorrect password");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post("/oauth", async (req, res) => {
  const { email, username, avatar } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user==null) {
      const genPassword = Math.random().toString(36).slice(-8);
      const hashPassword = await bcrypt.hash(genPassword, 10);
      user = new User({
        username,
        email,
        avatar,
        password: hashPassword,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    const { password: pass, ...others } = user._doc;
    others.token = token;
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
      })
      .json(others);
  } catch (err) {
    console.log(err);
  }
});

module.exports = route;
