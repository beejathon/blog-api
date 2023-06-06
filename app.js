require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('morgan');
const apiRouter = require('./routes/api');
const cors = require('cors');
require('./passport');
const app = express();

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGO_URI;
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

let corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

app.use('/api', cors(corsOptions), apiRouter);

module.exports = app;
