const User = require('../models/user');
const mongoose = require('mongoose');

exports.login = (req, res, next) => {
  res.json({ message: 'user logged in' })
}

exports.logout = (req, res, next) => {
  res.json({ message: 'user logged out' })
}