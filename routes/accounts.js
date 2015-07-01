var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Account = mongoose.model('Account'),
	Tenant = mongoose.model('Tenant'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	request = require('request'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	}),
	twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

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
router.post('/:account/verify', auth, function(req, res, next) {
	if (!req.body.amount1 || req.body.amount1 == '' || !req.body.amount2 || req.body.amount2 == '')
		return res.status(400).json({ message: 'Please provide both amounts.' });

	Tenant.findById(req.payload._id, function(err, tenant) {
		if (err)
			return next(err);

		// notify Dennis that someone is trying to verify
		twilio.sendMessage({
			to: '2107718253',
			from: '+18019013606',
			body: tenant.getFullName() + ' is trying to verify their account (' + req.account.bank_name + ' ' + req.account.last4 + ').'
		});

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
				twilio.sendMessage({
					to: '2107718253',
					from: '+18019013606',
					body: tenant.getFullName() + '\'s account (' + req.account.bank_name + ' ' + req.account.last4 +') has been verified.'
				});
			}
			else res.json(body);
		});
	});
});

/* POST bank account verification */
router.post('/:account/verify/email', auth, function(req, res) {
	req.account.populate('owner', function(err, account) {
		if (err)
			return next(err);

		account.owner.populate('property', function(err, tenant) {
			if (err)
				return next(err);

			tenant.property.populate('manager', function(err, property) {
				if (err)
					return next(err);

				// make POST request to verify account with stripe
				mandrill.messages.sendTemplate({
					'template_name': 'bank-account-verify',
					'template_content': null,
					'message': {
						'from_email': property.manager.email,
						'from_name': property.manager.getFullName(),
						'to': [{
							'email': tenant.email,
							'name': tenant.name_first,
							'type': 'to'
						}],
						'merge_language': 'handlebars',
						'global_merge_vars': [{
							'name': 'tenant_name',
							'content': tenant.name_first
						},{
							'name': 'manager_name',
							'content': property.manager.getFullName()
						},{
							'name': 'manager_phone',
							'content': property.manager.phone
						},{
							'name': 'link',
							'content': process.env.ROOT_NAME + '/#/accountDetails/' + req.account._id
						}]
					},
					'async': true
				}, function(result) {
					return res.json({message:'The email was sent successfully'});
				}, function(err) {
					return next(err);
				});
			});
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
