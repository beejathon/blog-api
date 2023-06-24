require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const apiRouter = require('./routes/api');
const cors = require('cors');
require('./passport');
const methodOverride = require('method-override');
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
app.use('/uploads', express.static('uploads'));
app.use(methodOverride('_method'));

let corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}
app.use(cors());
app.use('/api', cors(corsOptions), apiRouter);

module.exports = app;
