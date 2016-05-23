var express = require('express');
var findUser = require('./findUser');
var User = require('../models/User');

var login = function(req, res)
{
  const findUserPromise = new Promise(function(resolve, reject)
  {
    resolve(findUser(req, res, matchPassword = true));
    reject(err);
  });
};

module.exports = login;
