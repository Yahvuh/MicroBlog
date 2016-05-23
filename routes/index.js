var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Post = require('../models/Post');
var login = require('../middlewares/login');

/* GET home page. */
router.get('/', function(req, res, next)
{
	if(!req.session.user)
		return res.render('index', { loggedIn: loggedIn(req, res), title: 'MicroBlog' });

	return res.redirect('/dashboard');
});

router.route('/login')

	.get(function(req, res)
	{
		if(req.session.user)
			return res.redirect('/dashboard');

		res.render('login');
	})

	.post(function(req, res)
	{
		const loginPromise = new Promise(function(resolve, reject)
		{
			resolve(login(req, res));
			reject(err);
		});
	});

router.get('/dashboard', function(req, res)
{
	if(!req.session.user)
		return res.redirect('/login');
	res.render('dashboard', {loggedIn: loggedIn(req, res), username: req.session.user.username});
});

router.get('/logout', function(req, res)
{
	if(!req.session.user)
		return res.redirect('/login');

	req.session.destroy();
	//return res.status(200).send();
	return res.redirect('/');
});

router.route('/register')
	.get(function(req, res, next)
	{
		if(req.session.user)
		{
			return res.redirect('/dashboard');
		}
		res.render('register');
	})

	.post(function(req, res, next)
	{
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var username = req.body.username;
		var password = req.body.password;

		//If the username doesn't match alphanumeric, slash or underscore
		if(username != username.match(/^[a-z\d\-_]+$/i))
		{
			return res.redirect('back');
		}

		var newUser = new User();
		newUser.firstname = firstname;
		newUser.lastname = lastname;
		newUser.username = username;
		newUser.password = password;
		newUser.save(function(err, savedUser)
		{
			if(err)
				return res.status(500).send();

			return res.redirect('/login');
		});
	});

router.route('/@:username')
	.get(function(req, res)
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
			if(err || user == null)
				return res.status(404).send();

			var sameUser = false;
			var empty = false;
			var alreadyFollowing = false;

			if(req.session.user)
			{
				if(req.session.user.username == req.params.username)
					sameUser = true;

				//Ensures followers is not null, and makes sure its large than 0
				if(user.followers != null && user.followers.length > 0)
				{
					for (var i = 0; i < user.followers.length; i++)
					{
						if(user.followers[i] == req.session.user.username)
						{
							alreadyFollowing = true;
						}
					}
				}
			}
			//WHAAAA NESTING LOLOL

			//If there are no posts on their profile, return a different statement
			if(blogPosts.length == 0)
				empty = true;

			return res.render("user", {loggedIn: loggedIn(req, res), alreadyFollowing: alreadyFollowing, sameUser: sameUser, followers: user.followers, loggedIn: loggedIn, empty: empty, username: user.username, name: user.firstname + ' ' + user.lastname, blogPosts: blogPosts, date: user.timeString});
		});
	})

	.post(function(req, res, err)
	{
		if(req.body.followType == 'unfollow')
		{
			followType = req.body.followType;
		//	unfollowUser(followType, req, res, err);
		}
		User.findOne({username: req.params.username}, function(err, user)
		{
			var alreadyFollowing = false;

			if(err || !req.session.user)
				return res.status(404).send();

			//reduce how many times I use this in the future lol
			if(user.followers != null && user.followers.length > 0)
			{
				for(var i = 0; i < user.followers.length; i++)
				{
					if(user.followers[i] == req.session.user.username)
					{
						alreadyFollowing = true;
					}
				}
			}

			if(req.session.user.username == user.username || alreadyFollowing)
			{
				return res.sendStatus(403);
			} else
			{
				user.followers.push(req.session.user.username);
				user.save(function(err)
				{
					if(err)
						return res.send(err)

					res.redirect('/@' + req.params.username);
				});
			}
		});
	});

router.get('/users', function(req, res)
{
	var users = [];
	User.find(function(err, user)
	{
		if(err)
			return res.send(err);

		for(i=0;i<user.length;i++)
		{
			users.push(user[i].username);
		}

		return res.render('allUsers', {loggedIn: loggedIn(req, res), userCount: user.length, userList: users});
	});
});

//Create a post
router.post('/create', function(req, res)
{
	var username = req.session.user.username;
	var title = req.body.title;
	var content = req.body.content;

	if(!req.session.user)
		return res.sendStatus(403);

	if(title.match(/^\s+$/))
		return res.sendStatus(400);

	//If the title isn't alphanumeric, slash, underscore or any space /^[a-z0-9]+$/i
	if(title != title.match(/^[a-z\d\-_\s]+$/i) || title == null)
		return res.redirect('back');

	var newPost = new Post();
	newPost.username = username;
	newPost.title = title;
	//If there are any spaces or question marks, replace them
	title = title.replace(/ /g,"_").toLowerCase();
	newPost.urlTitle = title.replace(/\?/g,'-');
	newPost.content = content;
	newPost.save(function(err, savedPost)
	{
		if(err)
			return res.status(500).send();

		return res.redirect('/@' + newPost.username + '/' + newPost.urlTitle)
	});
});

router.route('/@:username/:urlTitle')

	.get(function(req, res)
	{
		Post.findOne({urlTitle: req.params.urlTitle}, function(err, post)
		{
			if(err)
			{
				return res.send(err);
			}
			//Fix this god damn nesting
			User.findOne({username: post.username}, function(err, user)
			{
				//Checks if there is a user session. If so, it checks if the session user is the same as the post user
			if(req.session.user)
			{
				if(req.session.user.username == req.params.username)
				{
					return res.render('post', {loggedIn: loggedIn(req, res), sameUser: true, username: post.username, urlTitle: post.urlTitle, content: post.content, title: post.title, postTime: post.timeString, name: user.firstname + " " + user.lastname});
				}
			}
			return res.render('post', {loggedIn: loggedIn(req, res), sameUser: false, username: post.username, urlTitle: post.title, content: post.content, title: post.title, postTime: post.timeString, name: user.firstname + " " + user.lastname});
			});
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
					return res.redirect('/@' + username);
				});
			}
		});

	});

router.route('/edit/:urlTitle')
	.post(function(req, res)
	{
		//Without sending 401, users not logged in would crash application
		if(!req.session.user)
		{
			return res.redirect('/login')
		}
		oldTitle = req.params.urlTitle.replace(/ /g,"_").toLowerCase();
		Post.findOne({urlTitle: oldTitle}, function(err, post)
		{
			if(err)
				return res.send(err);

			if(req.session.user.username == post.username && oldTitle == post.urlTitle)
			{
				if(err)
					return res.send(err);

				title = req.body.title;
				urlTitle = title.replace(/ /g,"_").toLowerCase();
				content = req.body.content;

				if(title != title.match(/^[a-z\d\-_\s]+$/i) || title == null)
					return res.redirect('back');

				post.update({title: title, content: content, urlTitle: urlTitle}, function(err)
				{
					if(err)
						return res.send(err);
				});
				res.redirect('/@' + post.username + '/' + urlTitle);
			}
		});
	});

const loggedIn = function(req, res)
{
	if(!req.session.user)
		return false;
	else
		return true;
}


module.exports = router;
