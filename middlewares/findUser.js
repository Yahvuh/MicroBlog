'use strict';

const User = require('../models/User');

const findUser = function(req, res, matchPassword) {
  User.findOne({username: req.body.username}, function(err, user) {
    if(!user) res.sendStatus(401);

    if(matchPassword && user)
      compare(user, req, res);
  });
};

const compare = function(user, req, res, err) {
  if(err) {
    //console.log('error')
    //return res.send(err);
    return res.sendStatus(401);
  }

  let password = req.body.password;
  user.comparePassword(password, function(err, isMatch) {
    if (err) throw err;
  	if(isMatch) {
  		let loggedIn = true;
  		req.session.user = user;
  		res.redirect('/dashboard');
  	}
  });
};

module.exports = findUser;
