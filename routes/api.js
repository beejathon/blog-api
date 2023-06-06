const express = require("express");
const router = express.Router();
const passport = require('passport')
const userController = require("../controllers/userController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

// POST - create new user
router.post("/users", userController.register);

// POST - log user in
router.post("/users/login", userController.login);

// POST - log user out
router.post("/users/logout", userController.logout);

// GET - all posts
router.get("/posts", postController.post_list);

// GET - individual post
router.get("/posts/:postid", postController.post_detail);

// POST - create post
router.post("/posts", passport.authenticate('jwt', {session: false}), postController.post_create);

// DELETE - delete post
router.delete("/posts/:postid", passport.authenticate('jwt', {session: false}), postController.post_delete);

// PUT - update post
router.put("/posts/:postid", passport.authenticate('jwt', {session: false}), postController.post_update);

// GET - all comments
router.get("/posts/:postid/comments", commentController.comment_list);

// GET - individual comment
router.get("/posts/:postid/comments/:commentid", commentController.comment_detail);

// POST - create comment
router.post("/posts/:postid/comments", passport.authenticate('jwt', {session: false}), commentController.comment_create);

// DELETE - delete comment
router.delete("/posts/:postid/comments/:commentid", passport.authenticate('jwt', {session: false}), commentController.comment_delete);

// PUT - update comment
router.put("/posts/:postid/comments/:commentid", passport.authenticate('jwt', {session: false}), commentController.comment_update);

module.exports = router;
