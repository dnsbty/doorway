var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Email = mongoose.model('Email');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST new email */
router.post('/email', function(req, res, next) {
	console.log(req.body);
	var email = new Email(req.body);
	console.log(email);
	email.save(function(err, post){
		if (err)
			return next(err);

		res.json(email);
	});
});

module.exports = router;
