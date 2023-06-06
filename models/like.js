const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  liker: { type: Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now(), required: true },
  postRef: { type: Schema.Types.ObjectId, ref: "Post" },
  commentRef: { type: Schema.Types.ObjectId, ref: "Comment" }
})

LikeSchema.virtual("date_formatted").get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_FULL);
})

module.exports = mongoose.model("Like", LikeSchema);