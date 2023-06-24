const { body, validationResult } = require('express-validator');
const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");

exports.comment_list = (req, res, next) => {
  Comment.find({ post: req.params.postid })
    .sort({ date: 1 })
    .populate("commenter", "userName")
    .then((comments) => {
      if (comments.length===0) return res.status(200).json({ message: "No comments." })
      res.status(200).json(comments);
    })
    .catch((err) => {
      res.status(400).json(err)
    })
}

exports.comment_detail = (req, res, next) => {
  Comment.findById(req.params.commentid)
    .populate("comenter", "userName")
    .then((comment) => {
      if (!comment) return res.status(200).json({ message: "No comment." })
      res.status(200).json(comment);
    })
    .catch((err) => {
      res.status(400).json(err)
    })
}

exports.comment_create = [
  body("comment", "Comment must not be empty.")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        data: req.body
      });
    }

    try {
      const comment = new Comment({
        commenter: req.user._id,
        comment: req.body.comment,
        date: Date.now(),
        post: req.params.postid
      })
      const post = await Post.findByIdAndUpdate(
        req.params.postid,
        { $inc: { commentCount: 1 } }
      )
      if (!post) return res.status(400).json({ message: 'Post not found' })
      await comment.save();
      res.status(200).json({ comment_created: comment })
    } catch (err) {
      return res.status(500).json('Error saving comment to db.')
    }
  }
]

exports.comment_delete = async (req, res, next) => {
  try {
    if (req.user.admin) {
      const comment = await Comment.findByIdAndRemove(req.params.commentid);
      if (!comment) return res.status(400).json({ message: 'Comment not found' })
      const likes = await Like.deleteMany({ commentRef: req.params.commentid });
      const post = await Post.findByIdAndUpdate(
        req.params.postid,
        { $inc: { commentCount: -1 } }
      )
      if (!post) return res.status(400).json({ message: 'Post not found' })
      res.status(200).json({ 
        comment_deleted: comment, 
        likes_deleted: likes 
      });
    } else {
      return res.status(403).json({ message: 'Admin access needed.'})
    }
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.comment_update = [
  body("comment", "Comment must not be empty.")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        error: errors.array(),
        data: req.body
      })
    }

    try {
      const comment = await Comment.findByIdAndUpdate(
        req.params.commentid,
        {
          comment: req.body.comment,
          date: Date.now()
        }
      )
      if (!comment) return res.status(400).json({ message: 'Comment not found' })
      res.status(200).json({ comment_updated: comment._id })
    } catch (err) {
      return res.status(500).json({ message:'Error saving comment to db.', error: err})
    }
  }
]

exports.comment_like = async (req, res, next) => {
  try {
    const like = new Like({
      liker: req.user._id,
      date: Date.now(),
      commentRef: req.params.commentid,
    })
    await like.save();
    res.status(200).json({ comment_liked: like })
  } catch (err) {
    res.status(500).json(err);
  }
}

exports.comment_unlike = async (req, res, next) => {
  try {
    const like = await Like.findByIdAndRemove(req.body.like_id);
    if (!like) return res.status(400).json({ message: 'Like not found' });
    res.status(200).json({ comment_unliked: like });
  } catch (err) {
    return res.status(500).json(err);
  }
}