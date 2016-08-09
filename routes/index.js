'use strict';

const express = require('express');
const router = express.Router();
const passportTwitter = require('../auth/twitter');
const Post = require('../models/Post');
const findUser = require('../middleware/findUser');
const findPosts = require('../middleware/findPosts');

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
	// apparently the only way to get users and posts in the same promise
	findUser(req.params.handle).then(function(user) {
		findPosts(user).then(function(posts) {
			let empty = false;
			if(posts.length === 0) {
				empty = true;
			}
			return res.render('user', { user: user, userPosts: posts, loggedIn: loggedIn(req), sameUser: sameUser(req, user), empty: empty });
		});
	}).catch(function(err) {
		console.error(err);
	});
});

router.get('/@:handle/:postID', function(req, res) {
	findUser(req.params.handle).then(function(user) {
		// Not using findPosts here, because I only need one result
		Post.findOne({ postID: req.params.postID}, function(err, post) {
			if(err)
				console.error(err);
			return res.render('includes/post', { user: user, post: post, loggedIn: loggedIn(req), sameUser: sameUser(req, user) });
		});
	});
});

//temp route to create posts
router.get('/create', function(req, res) {
	if(!req.user)
		return res.redirect('/');

	return res.render('create', { loggedIn: loggedIn(req), user: req.user });
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
