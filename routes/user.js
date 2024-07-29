const express = require("express");
const bcrypt = require("bcrypt");
const verifyToken = require("../utils/verifyToken");
const User = require("../models/user");

const route = express.Router();
route.put("/update/:userid", verifyToken, async (req, res) => {
  if (req.user.id == req.params.userid) {
    //console.log("User is updating his own data");
    //console.log(req.body);
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userid,
        {
          $set: {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            avatar: req.body.avatar,
          },
        },
        { new: true }
      );

      const { password, ...rest } = updatedUser._doc;
      res.status(200).json(rest);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("You can update only your account");
  }
});

route.get("/signout", (req, res) => {
  res.clearCookie("token").json("Logged out");
});

route.get("/get-metrics", verifyToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const totalUsers = await User.countDocuments();
      const totalUsersLastMonth = await User.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      });
      res.status(200).json({ totalUsers, totalUsersLastMonth });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed to see metrics");
  }
});

route.get("/getusers", verifyToken, async (req, res) => {
  const limit = req.query.limit || 5;
  const startIdx = req.query.startIdx || 0;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;
  if (req.user.isAdmin) {
    try {
      const users = await User.find()
        .skip(startIdx)
        .limit(limit)
        .sort({ createdAt: sortDirection });
      const usersWithoutPassword = users.map((user) => {
        const { password, ...others } = user._doc;
        return others;
      });

      res.status(200).json(usersWithoutPassword);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed to see all users");
  }
});

route.delete("/delete/:userid", verifyToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const user = await User.findById(req.params.userid);
      if (user.isAdmin) {
        return res.status(403).json("You cannot delete an admin user");
      }
      // Delete user
      await User.findByIdAndDelete(req.params.userid);

      res.status(200).json("User has been deleted...");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed to delete a user");
  }
});



module.exports = route;
