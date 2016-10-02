'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Post = new Schema({
  userID: String,
  postID: {type: String, index: {unique: true}},
  title: { type: String, required: true},
  content: String,
  image: String,
  comments: [{
    userID: String,
    handle: String,
    comment: String
  }]
},
{
  timestamps: true
});

module.exports = mongoose.model('post', Post);
