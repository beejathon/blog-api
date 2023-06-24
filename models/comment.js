const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  commenter: { type: Schema.Types.ObjectId, ref: "User" },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post" }
}, { toJSON: { virtuals: true } })

CommentSchema.virtual("date_formatted").get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_FULL);
})

module.exports = mongoose.model("Comment", CommentSchema);