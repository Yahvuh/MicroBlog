'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  userID: {type: String, index: {unique: true}},
  //token: String,

  // name initially starts out as twitter handle, but the user can change it
  name: String,
  handle: {type: String, index: {unique: true}}

});

module.exports = mongoose.model('user', User);
