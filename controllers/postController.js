const async = require('async');
const { body, validationResult } = require('express-validator')
const Post = require("../models/post");
const Comment = require("../models/comment")

exports.post_list = (req, res, next) => {
  Post.find({})
    .sort({ date: 1 })
    .populate("user")
    .exec(function (err, post) {
      if (err) {
        return res.json(err);
      }
      res.status(200).json(post);
    })
};

exports.post_detail = (req, res, next) => {
  async.parallel(
    {
      post(callback) {
        Post.findById(req.params.id)
        .populate("user")
        .exec(callback)
      },
      comments(callback) {
        Comment.find({ post: req.params.id})
          .sort({ date: 1 })
          .exec(callback)
      }
    },
    (err, results) => {
      if (err) {
        return res.json(err);
      }
      res.status(200).json(results)
    }
  );
}

exports.post_create = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("body", "Text must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        data: req.body
      });
    }

    const post = new Post( {
      title: req.body.title,
      text: req.body.body,
      date: Date.now(),
      user: req.user
    })

    post.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({post, token: req.user})
    })
  }
]

exports.post_delete = (req, res, next) => {
  async.parallel(
    {
      deletePost(callback) {
        Post.findByIdAndRemove(req.params.postid)
          .exec(callback)
      },
      deleteComments(callback) {
        Comment.deleteMany({ post: req.params.postid })
          .exec(callback)
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: `Post ${req.params.postid} deleted` })
    }
  )
}

exports.post_update = (req, res, next) => [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  body("body", "Text must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        error: errors.array(),
        data: req.body
      })
    }

    const post = new Post( {
      title: req.body.title,
      text: req.body.body,
      date: Date.now(),
      user: req.user,
      _id: req.params.id
    })

    post.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({post, token: req.user})
    })
  }
]