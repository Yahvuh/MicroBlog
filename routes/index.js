'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const passportTwitter = require('../auth/twitter');

// auth
router.get('/auth/twitter', passportTwitter.authenticate('twitter'));
router.get('/auth/twitter/callback', passportTwitter.authenticate('twitter', {
	successRedirect: '/',
	failiureRedirect: '/'
}));

/* GET home page. */
router.get('/', function(req, res) {
	return res.render('index', { loggedIn: loggedIn(req), user: req.user });
});

router.get('/edit', function(req, res) {
	if(!req.user) {
		return res.redirect('/');
	}

	return res.render('edit', { loggedIn: loggedIn(req), user: req.user });
});

router.get('/logout', function(req, res) {
	if(!req.session.passport) {
		return res.redirect('/');
	}

	req.logout();
	res.redirect('/');
});

router.get('/@:handle', function(req, res) {
	User.findOne({ 'handle': req.params.handle }, function(err, user) {
		if(err)
			console.error(err);

		return res.render('user', { user: user, loggedIn: loggedIn(req), sameUser: sameUser(req, user) });
	});
});

const loggedIn = function(req) {
	if(!req.user) {
		return false;
	}	else {
		return true;
	}
};

const sameUser = function(req, user) {
	if(!req.user) {
		return false;
	} else if (req.user.handle === user.handle) {
		return true;
	}
};

module.exports = router;
