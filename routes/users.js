var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

/* GET list of all users */
router.get('/', function(req, res, next) {
	User.find(function(err, posts){
		if (err)
			return next(err);

		res.json(posts);
	});
});

module.exports = router;
