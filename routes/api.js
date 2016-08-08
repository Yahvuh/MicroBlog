'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// /api routing
router.post('/profile', function(req, res, done) {
  if(!req.user) {
    return res.sendStatus(401);
  }

  // send a bad request if they body isn't alphanumeric
  if(!req.body.name.match(/^([0-9]|[a-z])+([0-9a-z]+)$/i)) {
    return res.sendStatus(400);
  }

  User.findOne({ 'userID': req.user.userID }, function(err, user) {
    if(err) {
      console.error(err);
    }

    user.name = req.body.name;
    user.handle = req.body.handle;

    user.save(function(err) {
      if(err)
        console.error(err);

      console.log('Updated user successfully');
      return done(null, user);
    });
  });

  return res.redirect('/@' + req.body.handle);
});

router.post('/profile', function(req, res) {
  if(!req.user) {
    return res.sendStatus(401);
  }

});

module.exports = router;
