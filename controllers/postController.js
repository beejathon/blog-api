const async = require('async');
const { body, validationResult } = require('express-validator')
const Post = require("../models/post");
const Comment = require("../models/comment")
const jwt = require("jsonwebtoken");

exports.post_list = (req, res, next) => {
  Post.find({})
    .sort({ date: 1 })
    .populate("user")
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      res.status(400).json(err)
    })
};

exports.post_detail = (req, res, next) => {
  Post.findById(req.params.postid)
    .populate("user")
    .then((post) => {
      res.status(200).json(post);
    })
    .catch((err) => {
      res.status(400).json(err)
    })
}

exports.post_create = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("content", "Content must not be empty.")
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

    const post = new Post( {
      title: req.body.title,
      content: req.body.content,
      date: Date.now(),
      user: req.user._id,
      published: false
    })

    try {
      await post.save();
      res.status(200).json({post})
    } catch (err) {
      return res.status(500).json('Error saving post to db.')
    }
  }
]

exports.post_delete = async (req, res, next) => {
  try {
    if (req.user.admin) {
      const post = await Post.findByIdAndRemove(req.params.postid);
      if (!post) return res.status(400).json({ message: 'Post not found' })
      const comments = await Comment.deleteMany({ post: req.params.postid });
      res.status(200).json({ post_deleted: post, comments_deleted: comments });
    } else {
      return res.status(403).json({ message: 'Admin access needed.'})
    }
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.post_update = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("content", "Content must not be empty.")
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

    const post = new Post( {
      title: req.body.title,
      content: req.body.content,
      date: Date.now(),
      user: req.user._id,
      published: false,
      _id: req.params.id
    })

    try {
      await post.save();
      res.status(200).json({post})
    } catch (err) {
      return res.status(500).json({ message:'Error saving post to db.'})
    }
  }
]