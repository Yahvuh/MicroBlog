var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Post = require('../models/Post');

/* GET home page. */
router.get('/', function(req, res, next)
{
	if(!req.session.user)
	{
		res.render('index', { title: 'MicroBlog' });
	}

	res.redirect('/dashboard');
});

router.route('/login')

	.get(function(req, res)
	{
		res.render('login');
	})

	.post(function(req, res, next)
	{
		console.log(req.body)
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
		res.redirect('/')
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
		console.log('POST request at /register');
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var username = req.body.username;
		var password = req.body.password;
		//console.log(req.get('Content-Type'));
		console.log(req.body)
		//console.log(req.params);

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
			return res.status(200).send();
		});
	});

router.get('/users/:username', function(req, res)
{
	//console.log(req.params);

	// var blogPosts = [
	// 	Post.find({username: "123"}, function(err, posts)
	// 	{
	// 		for(i=0;i<posts.length;i++)
	// 		{
	// 			posts[i];
	// 		}
	// 	})];

	var blogPosts = [];

	Post.find({username: "123"}, function(err, posts)
	{
		for(i=0;i<posts.length;i++)
		{
			//console.log(posts[i])
			//blogPosts.push(posts[i]);
			console.log(posts[i]);
			blogPosts.push(posts[i]);
		}
	});

	User.findOne({username: req.params.username}, function(err, user)
		{
			if(err)
			{
				return res.send(err);
			}
			console.log(blogPosts.length)
			res.render("user", {username: user.username, name: user.firstname + ' ' + user.lastname, blogPosts: blogPosts});
		});
});

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
	newPost.content = content;
	newPost.save(function(err, savedPost)
	{
		if(err)
		{
			console.log(err);
			res.status(500).send();
		}
		console.log('Post created');
	});
});

module.exports = router;
