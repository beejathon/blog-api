const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
})

PostSchema.virtual("url").get(function() {
  return `/post/${this._id}`;
})

PostSchema.virtual("date_formatted").get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_FULL);
})

module.exports = mongoose.model("Post", PostSchema);