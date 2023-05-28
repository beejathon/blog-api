const mongoose = require('mongoose');

exports.comment_list = (req, res, next) => {
  res.send({ message: 'all comments' })
}

exports.comment_detail = (req, res, next) => {
  res.send({ message: 'single comment' })
}

exports.comment_create = (req, res, next) => {
  res.send({ message: 'comment created' })
}

exports.comment_delete = (req, res, next) => {
  res.send({ message: 'comment deleted' })
}

exports.comment_update = (req, res, next) => {
  res.send({ message: 'comment updated' })
}