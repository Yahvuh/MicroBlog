'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const genPID = require('../middleware/genPID');
const checkDb = require('../middleware/checkDb');
//const findUser = require('../middleware/findUser');

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

// TODO: Make sure original author can only edit the post
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

router.post('/save/:postID', function(req, res, done) {
  if(!req.user)
    return res.sendStatus(401);

  Post.findOne({ postID: req.params.postID }, function(err, post) {
    if(err) console.error(err);
    User.findOne({ userID: req.user.userID }, function(err, user) {
      if(err) console.error(err);
      if(checkDb(user, post) === true) {
        console.error('Duplicate Found');
        return done(null);
      } else {
        console.log('ALL GOOD');
        let savedPosts = user.savedPosts;
        savedPosts.push(post);
        user.save(function(err) {
          if(err) console.error(err);

          console.log('Saved a post');
          return done(null, user);
        });
      }
    });
  });
  return res.redirect('/');
});

// delete a saved post
router.post('/unsave/:postID', function(req, res) {
  if(!req.user)
    return res.sendStatus(401);

  // duplicate the users savedPosts array
  let savedPosts = req.user.savedPosts;
  for(let i=0; i < req.user.savedPosts.length; i++) {
    if(req.params.postID === req.user.savedPosts[i].postID) {
      // once its found a saved post that matches the reqeusted post...
      // it splices the array, removing the post that was requested to be removed
      console.log('Found saved post');
      savedPosts.splice(i, 1);
    }
  }

  // then pushes it through mongoose, and updates the document
  User.findOneAndUpdate({ userID: req.user.userID }, { savedPosts: savedPosts }, { new: true }, function(err) {
    if(err) console.error(err);
  });

  return res.redirect('/');
});

router.post('/comment/:postID', function(req, res, done) {
  if(!req.user)
    return res.sendStatus(401);

  Post.findOne({ postID: req.params.postID }, function(err, post) {
    if(err) console.error(err);

    post.comments.push({
      userID: req.user.userID,
      handle: req.user.handle,
      comment: req.body.comment
    });

    post.save(function(err) {
      if(err) console.error(err);

      console.log('Posted comment');
      return done(null, post);
    });

    return res.redirect('/@' + req.user.handle + '/' + req.params.postID);
  });
});

// deletes a comment from an individual post
router.post('/uncomment/:postID/:commentID', function(req, res) {
  if(!req.user)
    return res.sendStatus(401);

  Post.findOne({ postID: req.params.postID}, function(err, post) {
    let comments = post.comments;
    for(let i=0; i<comments.length; i++) {
      //TODO: type conversion???
      if(req.params.commentID == comments[i]._id && req.user.userID == comments[i].userID) {
        console.log(' SAME POST');
        comments.splice(i, 1);
      }
    }

    post.update({ comments: comments }, function(err) {
      if(err) console.error(err);
      console.log('Comment deleted');
    });

    return res.redirect('/@' + req.user.handle + '/' + req.params.postID);
  });
});

router.post('/edit/:postID/:commentID', function(req, res) {
  if(!req.user)
    return res.sendStatus(401);

  Post.findOne({ postID: req.params.postID }, function(err, post) {
    if(err) console.error(err);

    let comments = post.comments;
    for(let i=0; i<comments.length; i++) {
      // TODO: DO THE TYPE CONVSERSION
      if(req.params.commentID == comments[i]._id && req.user.userID == comments[i].userID) {
        post.comments[i] = {
          userID: req.user.userID,
          handle: req.user.handle,
          comment: req.body.comment
        };

        post.save(function(err) {
          if(err) console.error(err);

          console.log('Post edited');
        });
      }
    }

    return res.redirect('/@' + req.user.handle + '/' + req.params.postID);
  });
});

module.exports = router;
