const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const { marked } = require("marked");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);
marked.use({
  mangle: false,
  headerIds: false
});

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String, required: true },
  date: { type: Date, default: Date.now(), required: true },
  published: { type: Boolean, required: true },
  commentCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  sanitizedHtml: { type: String, required: true },
}, { toJSON: { virtuals: true } })

PostSchema.virtual("date_formatted").get(function() {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_FULL);
})

PostSchema.pre('validate', function(next) {
  if (this.content) {
    this.sanitizedHtml = dompurify.sanitize(marked.parse(this.content, {}))
  }

  next();
})

module.exports = mongoose.model("Post", PostSchema);