var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Owner = mongoose.model('Owner'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	request = require('request'),
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
	req.owner.populate('properties', '_id address', function(err, owner) {
		res.json(owner);
	});
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

		// save the owner id into the manager as well for easy access
		owner.populate('manager', function(err, owner) {
			owner.manager.owners.push(owner);
			owner.manager.save(function(err, manager) {
				if (err)
					return next(err);
			});
		});

		res.json(owner);
	});
});

/* POST connected stripe account to an owner */
router.post('/:owner/stripe', auth, function(req, res) {
	if (!req.body.code || req.body.code == '')
		return res.status(400).json({ message: 'No Stripe code was received.' });

	// Make /oauth/token endpoint POST request
	request.post({
		url: 'https://connect.stripe.com/oauth/token',
		form: {
			client_secret: process.env.STRIPE_SECRET,
			code: req.body.code,
			grant_type: 'authorization_code'
		}
	}, function(err, r, body) {
		if (err)
			return next(err);

		body = JSON.parse(body);

		if (body.error)
			return res.status(502).json({ message: body.error_description });

		req.owner.stripe_id = body.stripe_user_id;
		req.owner.stripe_public = body.stripe_publishable_key;
		req.owner.stripe_access = body.access_token;
		req.owner.stripe_refresh = body.refresh_token;
		req.owner.save();
		res.json(req.owner);
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
