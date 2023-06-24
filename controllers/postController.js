const { body, validationResult } = require('express-validator');
const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");
const fs = require("fs");

exports.post_list = (req, res, next) => {
  Post.find({})
    .sort({ date: 1 })
    .populate("author", "userName")
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => {
      res.status(400).json(err)
    })
};

exports.post_detail = (req, res, next) => {
  Post.findById(req.params.postid)
    .populate("author", "userName")
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
      fs.unlink(req.file.path, (err) => {
        if (err) {
          return next(err);
        }
        console.log(`Successfully deleted image`);
      })
      res.status(400).json({
        errors: errors.array(),
        data: req.body
      });
    }

    try {
      const post = new Post({
        author: req.user._id,
        title: req.body.title,
        content: req.body.content,
        image: req.file.path,
        date: Date.now(),
        published: false,
        commmentCount: 0,
        likeCount: 0,
      })
      const newPost = await post.save();
      if (!newPost) return res.status(500).json({ message: 'Error saving to DB.' })
      res.status(200).json({ post: post })
    } catch (err) {
      return res.status(500).json({ error: err })
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
      fs.unlink(post.image, (err) => {
        if (err) {
          return next(err)
        }
        console.log(`Successfully deleted image`);
      })
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
      const image = await Post.findById(req.params.postid).select({ image: 1, _id: 0 });
      if (!image) return res.status(400).json({ message: 'Image not found' });
      fs.unlink(image.image, (err) => {
        if (err) {
          return next(err)    
        }
        console.log(`Successfully deleted image`);
      })
      const post = await Post.findByIdAndUpdate(
        req.params.postid,
        {
          title: req.body.title,
          content: req.body.content,
          image: req.file.path,
          date: Date.now()
        }
      )
      if(!post) return res.status(400).json({ message: 'Post not found' })
      res.status(200).json({ post_updated: post._id })
    } catch (err) {
      return res.status(500).json({ message:'Error updating post.', error: err})
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
    return res.status(500).json(err)
  }
}

exports.post_like = async (req, res, next) => {
  try {
    const like = new Like({
      liker: req.user._id,
      date: Date.now(),
      postRef: req.params.postid,
    })
    const post = await Post.findByIdAndUpdate(
      req.params.postid,
      { $inc: { likeCount: 1 } }
    )
    if (!post) return res.status(400).json({ message: 'Post not found' })
    await like.save();
    res.status(200).json(like)
  } catch (err) {
    return res.status(500).json(err);
  }
}

exports.post_unlike = async (req, res, next) => {
  try {
    const like = await Like.findByIdAndRemove(req.body.like_id);
    if (!like) return res.status(400).json({ message: 'Like not found' });
    const post = await Post.findByIdAndUpdate(
      req.params.postid,
      { $inc: { likeCount: -1 } }
    )
    if (!post) return res.status(400).json({ message: 'Post not found' })
    res.status(200).json(like)
  } catch (err) {
    return res.status(500).json(err);
  }
}

exports.post_likes_list = async (req, res, next) => {
  try {
    const likes = await Like.find({ postRef: req.params.postid })
    if (!likes) return res.status(400).json({ message: 'No likes'})
    return res.status(200).json(likes)
  } catch (err) {
    return res.status(500).json(err);
  }
}