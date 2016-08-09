'use strict';

const Post = require('../models/Post');

//pretty much just a copy of findUser
//returns array of all users posts
module.exports = function(user) {
  return new Promise(function(resolve, reject) {
    Post.find({ userID: user.userID }, function(err, posts) {
      if(err) return reject(err);
      resolve(posts);
    });
  });
};
