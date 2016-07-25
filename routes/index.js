'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const login = require('../middlewares/login');

/* GET home page. */
router.get('/', function(req, res) {
	if(!req.session.user)
		return res.render('index', { loggedIn: loggedIn(req), title: 'MicroBlog' });

	return res.redirect('/dashboard');
});

router.route('/login')

	.get(function(req, res)	{
		if(req.session.user)
			return res.redirect('/dashboard');

		res.render('login');
	})

	.post(function(req, res) {
		// const loginPromise = new Promise(function(resolve, reject) {
		// 	resolve(login(req, res));
		// 	reject(err);
		// });
		return login(req, res);
	});

router.get('/dashboard', function(req, res) {
	if(!req.session.user)
		return res.redirect('/login');
	res.render('dashboard', {loggedIn: loggedIn(req), username: req.session.user.username});
});

router.get('/logout', function(req, res) {
	if(!req.session.user)
		return res.redirect('/login');

	req.session.destroy();
	return res.redirect('/');
});

router.route('/register')
	.get(function(req, res) {
		if(req.session.user)
			return res.redirect('/dashboard');
		res.render('register');
	})

	.post(function(req, res) {
		let firstname = req.body.firstname;
		let lastname = req.body.lastname;
		let username = req.body.username;
		let password = req.body.password;

		//If the username doesn't match alphanumeric, slash or underscore
		if(username != username.match(/^[a-z\d\-_]+$/i))
			return res.redirect('back');

		const newUser = new User();
		newUser.firstname = firstname;
		newUser.lastname = lastname;
		newUser.username = username;
		newUser.password = password;
		newUser.save(function(err) {
			if(err) {
				return res.sendStatus(500);
			}

			return res.redirect('/login');
		});
	});

router.route('/@:username')
	.get(function(req, res) {
		//Create an array of blogposts.
		//Then, find all posts by the requests user, and push them into the array
		let blogPosts = [];

		Post.find({username: req.params.username}, function(err, posts) {
			for(let i=0;i<posts.length;i++)
				blogPosts.push(posts[i]);
		});

		//Actually find the user in question, send data to Jade to template
		User.findOne({username: req.params.username}, function(err, user) {
			if(err || user == null)
				return res.sendStatus(404);

			let sameUser = false;
			let empty = false;
			let alreadyFollowing = false;

			if(req.session.user) {
				if(req.session.user.username == req.params.username)
					sameUser = true;

				//Ensures followers is not null, and makes sure its large than 0
				if(user.followers != null && user.followers.length > 0) {
					for (let i = 0; i < user.followers.length; i++) {
						if(user.followers[i] == req.session.user.username) {
							alreadyFollowing = true;
						}
					}
				}
			}
			//WHAAAA NESTING LOLOL

			//If there are no posts on their profile, return a different statement
			if(blogPosts.length == 0)
				empty = true;
			return res.render("user", {loggedIn: loggedIn(req), alreadyFollowing: alreadyFollowing, sameUser: sameUser, followers: user.followers, empty: empty, username: user.username, name: user.firstname + ' ' + user.lastname, blogPosts: blogPosts, date: user.timeString});
		});
	})

	.post(function(req, res, err) {
		if(err)
			return res.send(err);
		if(req.body.followType == 'unfollow') {
			followType = req.body.followType;
		//	unfollowUser(followType, req, res, err);
		}
		User.findOne({username: req.params.username}, function(err, user) {
			let alreadyFollowing = false;

			if(err || !req.session.user)
				return res.sendStatus(404);

			//reduce how many times I use this in the future lol
			if(user.followers != null && user.followers.length > 0) {
				for(let i = 0; i < user.followers.length; i++) {
					if(user.followers[i] == req.session.user.username) {
						alreadyFollowing = true;
					}
				}
			}

			if(req.session.user.username == user.username || alreadyFollowing) {
				return res.sendStatus(403);
			} else {
				user.followers.push(req.session.user.username);
				user.save(function(err) {
					if(err)
						return res.send(err);

					res.redirect('/@' + req.params.username);
				});
			}
		});
	});

router.get('/users', function(req, res) {
	let users = [];
	User.find(function(err, user) {
		if(err)
			return res.send(err);

		for(let i=0;i<user.length;i++)
			users.push(user[i].username);

		return res.render('allUsers', {loggedIn: loggedIn(req), userCount: user.length, userList: users});
	});
});

//Create a post
router.post('/create', function(req, res) {
	let username = req.session.user.username;
	let title = req.body.title;
	let content = req.body.content;

	if(!req.session.user)
		return res.sendStatus(403);

	if(title.match(/^\s+$/))
		return res.sendStatus(400);

	//If the title isn't alphanumeric, slash, underscore or any space /^[a-z0-9]+$/i
	if(title != title.match(/^[a-z\d\-_\s]+$/i) || title == null)
		return res.redirect('back');

	const newPost = new Post();
	newPost.username = username;
	newPost.title = title;
	//If there are any spaces or question marks, replace them
	title = title.replace(/ /g,"_").toLowerCase();
	newPost.urlTitle = title.replace(/\?/g,'-');
	newPost.content = content;
	newPost.save(function(err) {
		if(err)
			return res.sendStatus(500);

		return res.redirect('/@' + newPost.username + '/' + newPost.urlTitle);
	});
});

router.route('/@:username/:urlTitle')

	.get(function(req, res) {
		Post.findOne({urlTitle: req.params.urlTitle}, function(err, post) {
			if(err) {
				return res.send(err);
			}
			//Fix this god damn nesting
			User.findOne({username: post.username}, function(err, user) {
			//Checks if there is a user session. If so, it checks if the session user is the same as the post user
			if(req.session.user) {
				if(req.session.user.username == req.params.username) {
					return res.render('post', {loggedIn: loggedIn(req), sameUser: true, username: post.username, urlTitle: post.urlTitle, content: post.content, title: post.title, postTime: post.timeString, name: user.firstname + " " + user.lastname});
				}
			}
			return res.render('post', {loggedIn: loggedIn(req), sameUser: false, username: post.username, urlTitle: post.title, content: post.content, title: post.title, postTime: post.timeString, name: user.firstname + " " + user.lastname});
			});
		});
	});

router.route('/post/:urlTitle')
	.post(function(req, res) {
		if(!req.session.user) {
			return res.sendStatus(401);
		}

		Post.findOne({urlTitle: req.params.urlTitle}, function(err, post) {
			if(err)
				return res.send(err);

			if(req.session.user.username == post.username && req.params.urlTitle == post.urlTitle) {
				let username = post.username;
				Post.remove({
					urlTitle: req.params.urlTitle
				}, function(err) {
					if(err)
						return res.send(err);

					return res.redirect('/@' + username);
				});
			}
		});

	});

router.route('/edit/:urlTitle')
	.post(function(req, res) {
		//Without sending 401, users not logged in would crash application
		if(!req.session.user)
			return res.redirect('/login');

		let oldTitle = req.params.urlTitle.replace(/ /g,"_").toLowerCase();
		Post.findOne({urlTitle: oldTitle}, function(err, post) {
			if(err)
				return res.send(err);

			if(req.session.user.username == post.username && oldTitle == post.urlTitle) {
				if(err)
					return res.send(err);

				let title = req.body.title;
				let urlTitle = title.replace(/ /g,"_").toLowerCase();
				let content = req.body.content;

				if(title != title.match(/^[a-z\d\-_\s]+$/i) || title == null)
					return res.redirect('back');

				post.update({title: title, content: content, urlTitle: urlTitle}, function(err) {
					if(err)
						return res.send(err);
				});
				res.redirect('/@' + post.username + '/' + urlTitle);
			}
		});
	});

const loggedIn = function(req) {
	if(!req.session.user) {
		return false;
	} else {
		return true;
	}
};


module.exports = router;
