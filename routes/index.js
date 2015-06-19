var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Email = mongoose.model('Email'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

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
