var express = require('express');
var router = express.Router();
var User = require('../models/User');


/* GET home page. */
router.get('/', function(req, res, next) 
{
	console.log("GET at /");
 	res.render('index', { title: 'MicroBlog' });
});

router.route('/login')

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
					return res.status(404).send();
				}

				user.comparePassword(password, function(err, isMatch)
				{
					if(isMatch && isMatch == true)
					{
						req.session.user = user;
						return res.status(200).send();
					}
					else
					{
						return res.status(401).send();
					}
				});
			});
	})

	.get(function(req, res)
	{
		res.render('login');
	});

router.get('/dashboard', function(req, res)
{
	if(!req.session.user)
	{
		return res.status(401).send()
	}
	
	//return res.status(200).send();

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
		console.log(username + ' ' + password);

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
	console.log(req.params);

	User.findOne({username: req.params.username}, function(err, user)
		{
			if(err)
			{
				return res.send(err);
			}

			res.render("user", {username: user.username, name: user.firstname + ' ' + user.lastname});
		});
});

module.exports = router;