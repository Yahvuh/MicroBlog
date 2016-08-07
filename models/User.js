'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  userID: {type: String, index: {unique: true}},
  token: String,
  name: String
});

module.exports = mongoose.model('user', User);
