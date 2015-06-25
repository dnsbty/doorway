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
  res.render('index', { stripeKey: process.env.STRIPE_PUBLISHABLE });
});

/* POST new email */
router.post('/emails', function(req, res, next) {
	if (!req.body.email || req.body.email == '')
		return res.status(400).json({ message: 'Please fill out all fields' });

	var email = new Email(req.body);
	email.save(function(err, post){
		if (err)
			return next(err);

		res.json(email);
	});
});

module.exports = router;
