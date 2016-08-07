'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const passportTwitter = require('../auth/twitter');

// auth
router.get('/auth/twitter', passportTwitter.authenticate('twitter'));

router.get('/auth/twitter/callback', passportTwitter.authenticate('twitter', {
	successRedirect: '/profile',
	failiureRedirect: '/'
}));
/* GET home page. */
router.get('/', function(req, res) {
	return res.render('index');
});

router.get('/profile', function(req, res) {
	console.log(req.session)
	if(!req.session.passport) {
		return res.redirect('/');
	}
	User.findOne({ '_id': req.session.passport.user}, function(err, user) {
		console.log('User logged in: \n' + user);
		req.user = user;
	});

	//console.log(req.session.passport.user);
	return res.render('profile', {user: req.user});
});

module.exports = router;
