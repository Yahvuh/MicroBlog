'use strict';

const express = require('express');
const router = express.Router();
const passportTwitter = require('../auth/twitter');
const User = require('../models/User');
const Post = require('../models/Post');

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
	User.findOne({ handle: req.params.handle }, function(err, user) {
		if(err)
			console.error(err);

		Post.find({ userID: user.userID }, function(err, posts) {
			if(err)
				console.error(err);
			let userPosts = [];
			for(let i=0; i<posts.length; i++) {
				userPosts.push(posts[i]);
				//console.log(posts)
			}
			//Check if the user has posted anything
			let empty = false;
			if(userPosts.length === 0) {
				empty = true;
			}
			return res.render('user', { empty: empty, user: user, loggedIn: loggedIn(req), sameUser: sameUser(req, user), userPosts: userPosts });
		});
	});
});

router.get('/@:handle/:postID', function(req, res) {
	User.findOne({ handle: req.params.handle}, function(err, user) {
		if(err)
			console.error(err);
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
