var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Post = require('../models/Post');

/* GET home page. */
router.get('/', function(req, res, next)
{
	if(!req.session.user)
	{
		return res.render('index', { title: 'MicroBlog' });
	}

	return res.redirect('/dashboard');
});

router.route('/login')

	.get(function(req, res)
	{
		res.render('login');
	})

	.post(function(req, res, next)
	{
		var username = req.body.username;
		var password = req.body.password;

		User.findOne({username: username}, function(err, user)
			{
				if(err)
				{
					return res.status(500).send
				}

				if(!user)
				{
					console.log('No User');
					return res.status(404).send();
				}

				user.comparePassword(password, function(err, isMatch)
				{
					if(isMatch && isMatch == true)
					{
						console.log('Logged In');
						req.session.user = user;
						//return res.status(200).send();
						res.redirect('/dashboard')
					}
					else
					{

						return res.status(401).send();
					}
				});
			});
	});

router.get('/dashboard', function(req, res)
{
	if(!req.session.user)
	{
		res.redirect('/login');

		//return res.status(401).send()
	}

	//return res.status(200).send();
	console.log('Accessed Dashboard');
	res.render('dashboard', {username: req.session.user.username});
});

router.get('/logout', function(req, res)
{
	req.session.destroy();
	return res.status(200).send();
});

router.route('/register')
	.get(function(req, res, next)
	{
		res.render('register');
	})

	.post(function(req, res, next)
	{
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var username = req.body.username;
		var password = req.body.password;

		var newUser = new User();
		newUser.firstname = firstname;
		newUser.lastname = lastname;
		newUser.username = username;
		newUser.password = password;
		newUser.save(function(err, savedUser)
		{
			if(err)
			{
				console.log(err);
				return res.status(500).send();
			}
			return res.redirect('/login');
		});
	});

router.get('/users/:username', function(req, res)
{
	//Create an array of blogposts.
	//Then, find all posts by the requests user, and push them into the array
	var blogPosts = [];

	Post.find({username: req.params.username}, function(err, posts)
	{
		for(i=0;i<posts.length;i++)
		{
			blogPosts.push(posts[i]);
		}
	});

	//Actually find the user in question, send data to Jade to template
	User.findOne({username: req.params.username}, function(err, user)
	{
		if(err)
		{
			//return res.send(err);
			return res.status(404).send()
		}
		if(user == null)
		{
			console.log('Not Found');
			return res.status(404).send({message: 'Not Found'});
		}
		if(blogPosts.length == 0)
		{
			return res.render("user", {notEmpty: false, username: user.username, name: user.firstname + ' ' + user.lastname, blogPosts: blogPosts});
		}

		return res.render("user", {notEmpty: true, username: user.username, name: user.firstname + ' ' + user.lastname, blogPosts: blogPosts});
	});
});

router.get('/users', function(req, res)
{
	var users = [];
	User.find(function(err, user)
	{
		if(err)
		{
			return res.send(err);
		}
		for(i=0;i<user.length;i++)
		{
			users.push(user[i].username);
		}
		return res.render('allUsers', {userCount: user.length, userList: users});
	});
});

//Create a post
router.post('/create', function(req, res)
{
	if(!req.session.user)
	{
		console.log('No user');
		return res.status(403).send();
	}
	var username = req.session.user.username;
	var title = req.body.title;
	var content = req.body.content;

	var newPost = new Post();
	newPost.username = username;
	newPost.title = title;
	newPost.urlTitle = title.replace(/ /g,"_").toLowerCase();
	newPost.content = content;
	newPost.save(function(err, savedPost)
	{
		if(err)
		{
			console.log(err);
			return res.status(500).send();
		}
		console.log('Post created');
		console.log(newPost);

		return res.redirect('/users/' + newPost.username + '/' + newPost.urlTitle)
	});
});

router.route('/users/:username/:urlTitle')

	.get(function(req, res)
	{
		Post.findOne({urlTitle: req.params.urlTitle}, function(err, post)
		{
			console.log(post.title)
			if(err)
			{
				return res.send(err);
			}

			//Checks if there is a user session. If so, it checks if the session user is the same as the post user
			if(req.session.user)
			{
				console.log('logged in');
				if(req.session.user.username == req.params.username)
				{
					console.log('same user');
					return res.render('post', {sameUser: true, username: post.username, urlTitle: post.urlTitle, content: post.content, title: post.title});
				}
				else
				{
					console.log('not the same user')
				}
			}
			else
			{
				console.log('not logged in');
			}

			console.log(post.id)

			return res.render('post', {sameUser: false, username: post.username, urlTitle: post.title, content: post.content, title: post.title});
		});
	});

router.route('/post/:urlTitle')
	.post(function(req, res)
	{
		if(!req.session.user)
		{
			return res.status(401).send();
		}

		Post.findOne({urlTitle: req.params.urlTitle}, function(err, post)
		{
			if(err)
			{
				return res.send(err);
			}

			if(req.session.user.username == post.username && req.params.urlTitle == post.urlTitle)
			{
				username = post.username;
				Post.remove(
				{
					urlTitle: req.params.urlTitle
				}, function(err, post)
				{
					if(err)
					{
						return res.send(err)
					}
					console.log('Deleted');
					return res.redirect('/users/' + username);
				});
			}
		});

	});

router.route('/edit/:urlTitle')
	.post(function(req, res)
	{
		console.log(req.params)
		//Without sending 401, users not logged in would crash application
		if(!req.session.user)
		{
			return res.redirect('/login')
		}
		oldTitle = req.params.urlTitle.replace(/ /g,"_").toLowerCase();
		console.log(oldTitle);
		Post.findOne({urlTitle: oldTitle}, function(err, post)
		{
			if(err)
			{
				return res.send(err);
				console.log('error')
			}
			console.log('starting check')
			if(req.session.user.username == post.username && oldTitle == post.urlTitle)
			{
				if(err)
				{
					return res.send(err);
				}

				console.log('replacing')
				title = req.body.title;
				urlTitle = title.replace(/ /g,"_").toLowerCase();
				content = req.body.content;
				console.log(post)
				post.update({title: title, content: content, urlTitle: urlTitle}, function(err)
				{
					if(err)
						return res.send(err);
				});
				console.log("Edited");
				res.redirect('/users/' + post.username + '/' + urlTitle);
			}
		});
	});

module.exports = router;
