const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  admin: { type: Boolean, required: true },
});

module.exports = mongoose.model("User", UserSchema);
