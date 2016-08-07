'use strict';

const passport = require('passport');
const User = require('../models/User');

module.exports = function() {
  passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });

  passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
      cb(err, user);
    });
  });
};
