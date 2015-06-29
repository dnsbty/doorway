var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Account = mongoose.model('Account'),
	Tenant = mongoose.model('Tenant'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	request = require('request'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all accounts */
router.get('/', auth, function(req, res, next) {
	Account.find(function(err, accounts){
		if (err)
			return next(err);

		res.json(accounts);
	});
});

/* GET a specified account */
router.get('/:account', auth, function(req, res, next) {
	res.json(req.account);
});

/* POST bank account verification */
router.post('/:account/verify', auth, function(req, res) {
	if (!req.body.amount1 || req.body.amount1 == '' || !req.body.amount2 || req.body.amount2 == '')
		return res.status(400).json({ message: 'Please provide both amounts.' });

	Tenant.findById(req.payload._id, function(err, tenant) {
		if (err)
			return next(err);

		// make POST request to verify account with stripe
		request.post({
			url: 'https://api.stripe.com/v1/customers/' + tenant.stripe_customer + '/bank_accounts/' + req.account.token + '/verify',
			headers: { Authorization: 'Bearer ' + process.env.STRIPE_SECRET },
			form: {
				'amounts': [req.body.amount1, req.body.amount2]
			},
			qsStringifyOptions: { arrayFormat: 'brackets' }
		}, function(err, r, body) {
			if (err)
				return next(err);

			body = JSON.parse(body);

			if (body.error)
				return res.status(502).json({ message: body.error.message });

			if (body.status == "verified") {
				req.account.validated = true;
				req.account.save();
				res.json(req.account);
			}
			else res.json(body)
			
		});
	});
});

/* Get account object when an account param is supplied */
router.param('account', function(req, res, next, id) {
	var query = Account.findById(id);
	query.exec(function (err, account){
		if (err)
			return next(err);
		if (!account)
			return next(new Error('Can\'t find account'));

		req.account = account;
		return next();
	});
});

module.exports = router;
