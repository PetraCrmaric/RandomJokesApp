const mongoose = require('mongoose');

const { Schema } = mongoose;
const UserSchema = new Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  token: String,
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
