var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	passport = require('passport'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* POST new login */
router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		if(user){
			if (user._type == 'Manager') {
				user.populate('owners', 'name', function(err, manager) {
					if (err)
						return next(err);

					res.json({
						user: manager,
						token: manager.generateJWT()
					});
				});
			} else {
				res.json({
					user: user,
					token: user.generateJWT()
				});
			}
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

/* GET list of all users */
router.get('/', auth, function(req, res, next) {
	User.find(function(err, posts){
		if (err)
			return next(err);

		res.json(posts);
	});
});

module.exports = router;
