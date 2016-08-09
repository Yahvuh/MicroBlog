'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const genPID = require('../middleware/genPID');

// /api routing
router.post('/profile', function(req, res, done) {
  if(!req.user) {
    return res.sendStatus(401);
  }

  // send a bad request if the body isn't alphanumeric
  if(!req.body.name.match(/^([0-9]|[a-z])+([0-9a-z]+)$/i) || !req.body.handle.match(/^([0-9]|[a-z])+([0-9a-z]+)$/i)) {
    return res.sendStatus(400);
  }

  User.findOne({ 'userID': req.user.userID }, function(err, user) {
    if(err) {
      console.error(err);
    }

    user.name = req.body.name;
    user.handle = req.body.handle;
    user.description = req.body.description;

    user.save(function(err) {
      if(err)
        console.error(err);

      console.log('Updated user successfully');
      return done(null, user);
    });
  });

  return res.redirect('/@' + req.body.handle);
});

router.post('/post', function(req, res, done) {
  if(!req.user) {
    return res.sendStatus(401);
  }
  console.log(req.body);

  //the usual
  // TODO: let symbols in (!, @, #, $ etc)
  // if(!req.body.title.match(/^([0-9]|[a-z])+([0-9a-z]+)$/i)) {
  //   return res.sendStatus(400);
  // }

  let newPost = new Post();
  newPost.title = req.body.title;
  newPost.content = req.body.content;
  newPost.postID = genPID();
  newPost.userID = req.user.userID;
  newPost.save(function(err) {
    if(err)
      throw err;

    console.log('Successfully created a post');
    return done(null, newPost);
  });

  return res.redirect('/@' + req.user.handle);
});

//TODO: Create middleware to find users/posts, to reduce LOC

router.post('/post/:postID', function(req, res) {
  if(!req.user)
    return res.sendStatus(401);

  Post.findOne({ postID: req.params.postID }, function(err, post) {
    if(err)
      console.error(err);

    if(req.user.userID === post.userID && req.params.postID === post.postID) {
      Post.remove({
        postID: req.params.postID
      }, function(err, post) {
        if(err)
          console.error(err);
        console.log('Post deleted: ' + post);
      });
      return res.redirect('/@' + req.user.handle);
    }
  });
});

router.post('/edit/:postID', function(req, res) {
  if(!req.user)
    return res.sendStatus(401);

  Post.findOne({ postID: req.params.postID }, function(err, post) {
    if(err)
      console.error(err);
    if(req.user.userID === post.userID && req.params.postID === post.postID) {
      let title = req.body.title;
      let content = req.body.content;

      post.update({ title: title, content: content }, function(err) {
        if(err)
          console.error(err);
        console.log('Post edited');
      });

      return res.redirect('/@' + req.user.handle + '/' + post.postID);
    }
  });
});

module.exports = router;
