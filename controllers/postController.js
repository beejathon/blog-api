const { body, validationResult } = require('express-validator');
const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");
const cloudinary = require('../cloudinary');

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
        image: req.body.image,
        imageId: req.body.imageId,
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

exports.post_img_upload = async (req, res, next) => {
  try {
    const file = req.files.image;
    await cloudinary.uploader.upload(file.tempFilePath,
    { 
      upload_preset: 'iqh8rvti',
      allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'jfif']
    }, 
    (err, result) => {
      if (err) {
        return res.status(400).json(err); 
      }
      return res.status(200).json(result)
    });
  } catch (err) {
    console.log(err)
  }

}

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
      const post = await Post.findById(req.params.postid)
      post.title = req.body.title;
      post.content = req.body.content;
      post.image = req.body.image;
      post.imageId = req.body.imageId;
      post.date = Date.now();
      const updatedPost = await post.save()
      if(!updatedPost) return res.status(400).json({ message: 'Post not found' })
      res.status(200).json({ post_updated: updatedPost })
    } catch (err) {
      return res.status(500).json({ message: err})
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