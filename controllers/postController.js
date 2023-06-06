const { body, validationResult } = require('express-validator')
const Post = require("../models/post");
const Comment = require("../models/comment")
const Like = require("../models/like")

exports.post_list = (req, res, next) => {
  Post.find({})
    .sort({ date: 1 })
    .populate("author", "username")
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      res.status(400).json(err)
    })
};

exports.post_detail = (req, res, next) => {
  Post.findById(req.params.postid)
    .populate("author", "username")
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
      res.status(200).json({ post_created: post })
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
      const likes = await Like.deleteMany({ postRef: req.params.postid });
      res.status(200).json({ 
        post_deleted: post, 
        comments_deleted: comments, 
        likes_deleted: likes 
      });
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

    try {
      const post = await Post.findByIdAndUpdate(
        req.params.postid,
        {
          title: req.body.title,
          content: req.body.content,
          date: Date.now()
        }
      )
      if (!post) return res.status(400).json({ message: 'Post not found' })
      res.status(200).json({ post_updated: post._id })
    } catch (err) {
      return res.status(500).json({ message:'Error saving post to db.', error: err})
    }
  }
]

exports.post_publish = async (req, res, next) => {
  try {
    if (req.user.admin) {
      const post = await Post.findByIdAndUpdate(req.params.postid, { published: true });
      if (!post) return res.status(400).json({ message: 'Post not found' })
      res.status(200).json({ post_published: post._id });
    } else {
      return res.status(403).json({ message: 'Admin access needed.'})
    }
  } catch (err) {
    return res.status(500).json(err)
  }
}

exports.post_unpublish = async (req, res, next) => {
  try {
    if (req.user.admin) {
      const post = await Post.findByIdAndUpdate(req.params.postid, { published: false });
      if (!post) return res.status(400).json({ message: 'Post not found' })
      res.status(200).json({ post_unpublished: post });
    } else {
      return res.status(403).json({ message: 'Admin access needed.'})
    }
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.post_like = async (req, res, next) => {
  try {
    const like = new Like({
      liker: req.user._id,
      date: Date.now(),
      postRef: req.params.postid,
    })
    await like.save();
    res.status(200).json({ post_liked: like })
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.post_unlike = async (req, res, next) => {
  try {
    const like = await Like.findByIdAndRemove(req.body.like_id);
    if (!like) return res.status(400).json({ message: 'Like not found' });
    res.status(200).json({ post_unliked: like })
  } catch (err) {
    res.status(500).json(err)
  }
}