'use strict';

const findUser = require('./findUser');

const login = function(req, res) {
  //MatchPassword is just telling the server that it is a login request.
  //Otherwise, the default FindUser module will just search for a user and return them
  let matchPassword = true;
  findUser(req, res, matchPassword);
};

module.exports = login;
