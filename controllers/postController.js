const mongoose = require('mongoose');

exports.post_list = (req, res, next) => {
  res.send({ message: 'all posts' })
}

exports.post_detail = (req, res, next) => {
  res.send({ message: 'single post' })
}

exports.post_create = (req, res, next) => {
  res.send({ message: 'post created' })
}

exports.post_delete = (req, res, next) => {
  res.send({ message: 'post deleted' })
}

exports.post_update = (req, res, next) => {
  res.send({ message: 'post updated' })
}