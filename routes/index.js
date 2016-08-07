'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passportTwitter = require('../auth/twitter');

// auth
router.get('/auth/twitter', passportTwitter.authenticate('twitter'));
router.get('/auth/twitter/callback', passportTwitter.authenticate('twitter', {
	successRedirect: '/profile',
	failiureRedirect: '/'
}));

/* GET home page. */
router.get('/', function(req, res) {
	return res.render('index', { loggedIn: loggedIn(req) });
});

router.get('/profile', function(req, res) {
	if(!req.user) {
		return res.redirect('/');
	}
	User.findOne({ '_id': req.session.passport.user}, function(err, user) {
		console.log('User logged in: \n' + user);
		req.user = user;
	});

	return res.render('profile', { loggedIn: loggedIn(req), user: req.user });
});

router.get('/logout', function(req, res) {
	if(!req.session.passport) {
		return res.redirect('/');
	}

	req.logout();
	res.redirect('/');
});

const loggedIn = function(req) {
	if(!req.user) {
		return false;
	}	else {
		return true;
	}
};

module.exports = router;
