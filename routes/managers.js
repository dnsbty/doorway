var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Manager = mongoose.model('Manager'),
	Owner = mongoose.model('Owner'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	request = require('request'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	}),
	twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

/* GET list of all managers */
router.get('/', auth, function(req, res, next) {
	Manager.find({ '_type' : 'Manager' }, function(err, managers){
		if (err)
			return next(err);

		res.json(managers);
	});
});

/* GET specified manager */
router.get('/:manager', auth, function(req, res) {
	res.json(req.manager);
});

/* GET list of all properties belonging to a manager */
router.get('/:manager/properties', auth, function(req, res, next) {
	req.manager.populate('properties', function(err, manager) {
		if (err)
			return next(err);
		res.json(manager);
	});
})

/* POST a new manager */
router.post('/', function(req, res, next) {
	if (!req.body.email || !req.body.password)
		return res.status(400).json({ message: 'Please fill out all fields' });
	
	var manager = new Manager();
	manager.email = req.body.email;
	manager.setPassword(req.body.password);

	// optional fields
	if (req.body.name_first && req.body.name_first !== '')
		manager.name_first = req.body.name_first;
	if (req.body.name_last && req.body.name_last !== '')
		manager.name_last = req.body.name_last;
	if (req.body.phone && req.body.phone !== '')
		manager.phone = req.body.phone;

	// save everything to the database
	manager.save(function(err) {
		if (err)
			return next(err);

		res.json({
			user: manager,
			token: manager.generateJWT()
		});
		res.end();

		// notify Dennis that a manager signed up
		twilio.sendMessage({
			to: '2107718253',
			from: '+18019013606',
			body: manager.getFullName() + ' just signed up'
		});
	});
});

/* PUT changes to a manager */
router.put('/:manager', auth, function(req, res) {
	console.log('Body: \n' + JSON.stringify(req.body));
	if (req.body.name_first)
		req.manager.name_first = req.body.name_first;
	if (req.body.name_last)
		req.manager.name_last = req.body.name_last;
	if (req.body.email)
		req.manager.email = req.body.email;
	if (req.body.phone)
		req.manager.phone = req.body.phone;
	if ('multiple_owners' in req.body)
		req.manager.multiple_owners = req.body.multiple_owners;
	if ('onboarding' in req.body)
		req.manager.onboarding = req.body.onboarding;
	if (req.body.application_fee)
		req.manager.application_fee = req.body.application_fee;
	console.log(req.manager);
	req.manager.save();
	res.json(req.manager);
});

/* POST connected stripe account to a manager */
router.post('/:manager/stripe', auth, function(req, res) {
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

		req.manager.stripe_id = body.stripe_user_id;
		req.manager.stripe_public = body.stripe_publishable_key;
		req.manager.stripe_access = body.access_token;
		req.manager.stripe_refresh = body.refresh_token;
		owner = new Owner({
			name: req.manager.getFullName(),
			manager: req.manager,
			stripe_id: body.stripe_user_id,
			stripe_public: body.stripe_publishable_key,
			stripe_access: body.access_token,
			stripe_refresh: body.refresh_token
		});
		owner.save();
		req.manager.owners.push(owner._id);
		req.manager.save();

		res.json(req.manager);
	});
});

/* Get manager object when a manager param is supplied */
router.param('manager', function(req, res, next, id) {
	var query = Manager.findById(id);
	query.exec(function (err, manager){
		if (err)
			return next(err);
		if (!manager)
			return next(new Error('Can\'t find manager'));

		req.manager = manager;
		return next();
	});
});

module.exports = router;
