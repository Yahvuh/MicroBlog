'use strict';

const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

const User = require('../models/User');
const config = require('../_config');
const init = require('./init');

passport.use(new TwitterStrategy({
  consumerKey: config.twitter.consumerKey,
  consumerSecret: config.twitter.consumerSecret,
  callbackURL: config.twitter.callbackURL
  },
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
      User.findOne({ 'userID': profile.id}, function(err, user) {
        if(err) {
          return done(err);
        }
        if(user) {
          return done(null, user);
        } else {
          let newUser = new User();
          newUser.userID = profile.id;
          newUser.token  = token;
          newUser.name   = profile.username;
          newUser.save(function(err) {
            if(err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }
));

init();

module.exports = passport;
