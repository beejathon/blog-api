require('dotenv').config();
require('./passport');
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');
const apiRouter = require('./routes/api')
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGO_URI;
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// routes
app.use('/api/', apiRouter);

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
