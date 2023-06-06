const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
  published: { type: Boolean, required: true },
})

PostSchema.virtual("url").get(function() {
  return `/post/${this._id}`;
})

PostSchema.virtual("date_formatted").get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_FULL);
})

module.exports = mongoose.model("Post", PostSchema);