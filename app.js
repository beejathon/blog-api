require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const apiRouter = require('./routes/api');
const cors = require('cors');
require('./passport');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
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
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(fileUpload({ useTempFiles: true }))

let corsOptions = {
  origin: [
    'http://localhost:3000', 
    'https://beejathon.github.io',
    'https://beejathon.github.io/portfolio/#/portfolio/blog',
    'https://beejathon.github.io/blog-cms'
  ],
  optionsSuccessStatus: 200
}
app.use('/api', cors(corsOptions), apiRouter);
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.all("/api/*", function(req, res, next) {
  if (req.method.toLowerCase() !== "options") {
    return next();
  }
  return res.send(204);
});

module.exports = app;
