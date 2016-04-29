var express = require('express');
var router = express.Router();

//In app.js, /admin is defined as the route. So technically / is /admin in this case
router.get('/', function(req, res, next)
{
	console.log("GET at /admin");
	res.render('admin');
});

module.exports = router;