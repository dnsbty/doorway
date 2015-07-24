var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Tenant = mongoose.model('Tenant'),
	Property = mongoose.model('Property'),
	Account = mongoose.model('Account'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all tenants */
router.get('/', auth, function(req, res, next) {
	Tenant.find({ '_type' : 'Tenant', current: {$ne: false} }, function(err, tenants){
		if (err)
			return next(err);

		res.json(tenants);
	});
});

/* GET specified tenant */
router.get('/:tenant', auth, function(req, res) {
	res.json(req.tenant);
});

/* PUT changes to tenant info */
router.put('/:tenant', auth, function(req, res, next) {
	if (req.body.email)
		req.tenant.email = req.body.email;
	if (req.body.name_first)
		req.tenant.name_first = req.body.name_first;
	if (req.body.name_last)
		req.tenant.name_last = req.body.name_last;
	if (req.body.phone)
		req.tenant.phone = req.body.phone;
	if (req.body.password && req.body.password == req.body.password2)
		req.tenant.setPassword(req.body.password);
	req.tenant.save();
	res.json(req.tenant);
});

/* DELETE a tenant */
router.delete('/:tenant', auth, function(req, res) {
	req.tenant.disable(function(err, tenant){
		if (err)
			return next(err);
		res.json(req.tenant);
	});
});

/* POST a new tenant login */
router.post('/:tenant/login', function(req, res, next) {
	if (!req.body.hash)
		return res.status(400).json({ message: 'Please include all fields' });

	if (req.tenant.last_login || req.body.hash !== req.tenant.hash)
		return res.status(403).json({ message: 'Invalid account' });

	req.tenant.last_login = Date.now();
	req.tenant.save();

	req.tenant.populate('property', function(err, tenant) {
		if (err)
			return next(err);

		console.log(tenant);
		return res.json({
			user: tenant,
			token: tenant.generateJWT()
		});
	});
});

/* POST a new tenant bank account */
router.post('/:tenant/accounts', function(req, res, next) {
	if (!req.body.id)
		return res.status(400).json({ message: 'Please include all fields' });

	// create the account in the database
	var account = new Account();
	account.token = req.body.id;
	account.bank_name = req.body.bank_account.bank_name;
	account.last4 = req.body.bank_account.last4;
	account.created = req.body.created * 1000;
	account.owner = req.tenant;
	account.save();

	// attach the account to the stripe customer
	stripe.customers.update(req.tenant.stripe_customer, {
		source: account.token
	}, function(err, customer) {
		if (err)
			return next(err);

		// save the new account token to the database
		account.token = customer.sources.data[0].id;
		account.save();

		return res.json(account);
	});
})

/* Get tenant object when a tenant param is supplied */
router.param('tenant', function(req, res, next, id) {
	var query = Tenant.findById(id);
	query.exec(function (err, tenant){
		if (err)
			return next(err);
		if (!tenant)
			return next(new Error('Can\'t find tenant'));

		req.tenant = tenant;
		return next();
	});
});

/* Get property object when a property param is supplied */
router.param('property', function(req, res, next, id) {
	var query = Property.findById(id);
	query.exec(function (err, property){
		if (err)
			return next(err);
		if (!property)
			return next(new Error('Can\'t find property'));

		req.property = property;
		return next();
	});
});

module.exports = router;
