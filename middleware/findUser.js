'use strict';

const User = require('../models/User');

//attempting to use promises, and make readable middleware
module.exports = function(handle) {
  return new Promise(function(resolve, reject) {
    User.findOne({ handle: handle }, function(err, user) {
      if(err) return reject(err);
      resolve(user);
    });
  });
};
