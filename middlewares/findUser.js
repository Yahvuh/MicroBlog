var express = require('express');
var User = require('../models/User');

var findUser = function(req, res, matchPassword)
{
  User.findOne({username: req.body.username}, function(err, user)
  {
    if(!user) res.sendStatus(401);

    if(matchPassword && user)
      compare(user, req, res)
  });
}

var compare = function(user, req, res, err)
{
  password = req.body.password;
  user.comparePassword(password, function(err, isMatch)
  {
    if (err) throw err;
  	if(isMatch)
  	{
  		loggedIn = true;
  		req.session.user = user;
  		res.redirect('/dashboard');
  	}
  });
}

module.exports = findUser;
