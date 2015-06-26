var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all owners */
router.get('/', auth, function(req, res, next) {
	Owner.find(function(err, owners){
		if (err)
			return next(err);

		res.json(owners);
	});
});

/* GET specified owner */
router.get('/:owner', auth, function(req, res) {
	res.json(req.owner);
});

/* POST a new owner */
router.post('/', auth, function(req, res, next) {
	if (!req.body.name || req.body.name == '')
		return res.status(400).json({ message: 'Please provide a name to identify the owner' });
	
	var owner = new Owner(req.body);
	owner.manager = req.payload;

	owner.save(function(err) {
		if (err)
			return next(err);
		return res.json(owner);
	});
});

/* PUT changes to an owner */
router.put('/:owner', auth, function(req, res) {
	if (req.body.name)
		req.owner.name = req.body.name;
	if (req.body.stripe_id)
		req.owner.stripe_id = req.body.stripe_id;
	if (req.body.stripe_public)
		req.owner.stripe_public = req.body.stripe_public;
	if (req.body.stripe_access)
		req.owner.stripe_access = req.body.stripe_access;
	if (req.body.stripe_refresh)
		req.owner.stripe_refresh = req.body.stripe_refresh;
	req.owner.save();
	res.json(req.owner);
});

/* Get owner object when an owner param is supplied */
router.param('owner', function(req, res, next, id) {
	var query = Owner.findById(id);
	query.exec(function (err, owner){
		if (err)
			return next(err);
		if (!owner)
			return next(new Error('Can\'t find owner'));

		req.owner = owner;
		return next();
	});
});

module.exports = router;
