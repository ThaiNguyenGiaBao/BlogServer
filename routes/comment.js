const express = require("express");
const route = express.Router();
const verifyToken = require("../utils/verifyToken");
const Comment = require("../models/comment");
const User = require("../models/user");

route.post("/addcomment", verifyToken, async (req, res) => {
  const newComment = new Comment({
    userId: req.user.id,
    postId: req.body.postId,
    content: req.body.content,
  });
  try {
    const savedComment = await newComment.save();
    console.log("Save success");
    res.status(200).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update likes of a comment
route.put("/update-likes/:commentId", verifyToken, async (req, res) => {
  // console.log(req.body.likes);
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json("Comment not found");
    }
    comment.likes = req.body.likes;
    // Save changes
    const updatedComment = await comment.save();
    res.status(200).json(updatedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

route.put("/edit/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (comment.userId === req.user.id) {
      // Only update the content of comment
      comment.content = req.body.content;
      const updatedComment = await comment.save();
      res.status(200).json(updatedComment);
    } else {
      res.status(401).json("You can update only your comment");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

route.delete("/delete/:commentId", verifyToken, async (req, res) => {
  //console.log(req.params.commentId);

  const comment = await Comment.findById(req.params.commentId);
  if (comment == null) {
    res.status(404).json("Comment not found");
  }
  if (comment.userId == req.user.id || req.user.isAdmin) {
    // Delete comment
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json("Comment deleted");
  } else {
    res.status(401).json("You can delete only your comment");
  }
});

route.get("/get-metrics", verifyToken, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const totalComments = await Comment.countDocuments();
      const totalCommentsLastMonth = await Comment.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        },
      });

      res.status(200).json({ totalComments, totalCommentsLastMonth });
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed to see metrics");
  }
});

route.get("/getcomments", async (req, res) => {
  //console.log(req.params.postId);
  const limit = req.query.limit || 10;
  const start = req.query.start || 0;
  try {
    const comments = await Comment.find()
      .skip(parseInt(start))
      .limit(parseInt(limit));
    const commentsWithUser = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findById(comment.userId);
        if (user) {
          console.log(user._id);
          return {
            ...comment._doc,
            user: {
              username: user.username,
              avatar: user.avatar,
            },
          };
        } else {
          // Remove this comment
          await Comment.findByIdAndDelete(comment._id);
          console.log("User not found");
        }
      })
    );

    const filteredComments = commentsWithUser.filter((comment) => {
      return comment != null && comment.user != null;
    });
    res.status(200).json(filteredComments);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = route;

route.get("/:postId", async (req, res) => {
  //console.log(req.params.postId);
  try {
    const comments = await Comment.find({ postId: req.params.postId });
    //console.log(comments.length);
    //console.log(comments);
    const commentsWithUser = await Promise.all(
      comments.map(async (comment) => {
        const user = await User.findById(comment.userId);
        if (user) {
          console.log(user._id);
          return {
            ...comment._doc,
            user: {
              username: user.username,
              avatar: user.avatar,
            },
          };
        } else {
          console.log("User not found");
        }
      })
    );

    const filteredComments = commentsWithUser.filter((comment) => {
      return comment != null && comment.user != null;
    });
    res.status(200).json(filteredComments);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = route;
