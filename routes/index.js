var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) 
{
	console.log("GET at /");
 	res.render('index', { title: 'MicroBlog' });
});

module.exports = router;
