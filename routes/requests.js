var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Request = mongoose.model('Request'),
	Message = mongoose.model('Message'),
	Tenant = mongoose.model('Tenant'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all maintenance requests */
router.get('/', auth, function(req, res, next) {
	var filter = {};
	if (req.payload._type == "Manager")
		filter.manager = req.payload._id;
	else if (req.payload._type == "Tenant")
		filter.tenant = req.payload._id;

	Request.find(filter)
	.populate({ path: 'property', select: '_id address'})
	.exec(function(err, requests){
		if (err)
			return next(err);

		res.json(requests);
	});
});

/* GET specified maintenance request */
router.get('/:request', auth, function(req, res) {
	req.request.populate('property messages tenant manager', function(err, request) {
		if (err)
			return next(err);

		res.json(request);
	});
});

/* POST a new maintenace request */
router.post('/', auth, function(req, res, next) {
	if (req.payload._type !== "Tenant")
		return res.status(403).json({ message: 'Only tenants may create maintenance requests' });
	if (!req.body.subject || req.body.subject == '')
		return res.status(400).json({ message: 'Please provide a subject to identify your maintenance request' });
	if (!req.body.message || req.body.message == '')
		return res.status(400).json({ message: 'Please provide a message detailing your maintenance request' });

	Tenant.findById(req.payload._id, function(err, tenant) {
		var request = new Request({
			property: tenant.property,
			tenant: tenant,
			manager: tenant.manager,
			created: new Date(),
			status: 'open',
			subject: req.body.subject
		});
		var message = new Message({
			sender: tenant,
			recipient: tenant.manager,
			sent: new Date(),
			body: req.body.message
		});

		console.log(message);
		message.save(function(err) {
			request.messages.push(message);
			console.log(request);
			request.save(function(err) {
				if (err)
					return next(err);

				res.json(request);
			});
		});
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

/* Get maintenance request object when a request param is supplied */
router.param('request', function(req, res, next, id) {
	var query = Request.findById(id);
	query.exec(function (err, request){
		if (err)
			return next(err);
		if (!request)
			return next(new Error('Can\'t find maintenance request'));

		req.request = request;
		return next();
	});
});

module.exports = router;
