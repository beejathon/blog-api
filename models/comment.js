const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  commenter: { type: String, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post" }
})

CommentSchema.virtual("url").get(function() {
  return `/post/${this._id}`;
})

CommentSchema.virtual("date_formatted").get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_FULL);
})

module.exports = mongoose.model("Comment", CommentSchema);