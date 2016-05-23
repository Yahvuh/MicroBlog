var express = require('express');
var User = require('../models/User');

var findUser = function(req, res, matchPassword)
{
  username = req.body.username;
  password = req.body.password;
  return User.findOne({username: username}, function(err, user, password)
  {
    if(!user)
      //throw new Error('Could not find user ' + username);
      res.sendStatus(401)

    if(matchPassword && user)
      compare(user, password, req, res);
  });
}

var compare = function(user, password, req, res)
{
  return user.comparePassword(password, function(isMatch)
  {
  	if(isMatch)
  	{
  		loggedIn = true;
  		req.session.user = user;
  		res.redirect('/dashboard');
  	}
  });
}

module.exports = findUser;
