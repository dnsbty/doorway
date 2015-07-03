var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Payment = mongoose.model('Payment'),
	Tenant = mongoose.model('Tenant'),
	Account = mongoose.model('Account'),
	Property = mongoose.model('Property'),
	Owner = mongoose.model('Owner'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET all payments */
router.get('/', auth, function(req, res, next) {
	Payment.find(function(err, payments){
		if (err)
			return next(err);

		res.json(payments);
	});
});

/* GET specified payment */
router.get('/:payment', auth, function(req, res, next) {
	res.json(req.payment);
});

/* POST a new payment */
router.post('/', auth, function(req, res, next) {
	console.log(req.body.payment);
	if (!req.body.payment || !req.body.payment.amount || req.body.payment.amount == "")
		return res.status(400).json({ message: 'Please provide an amount to pay.' });

	Tenant.findById(req.payload._id, function(err, tenant) {
		if (err)
			return next(err);

		Property.findById(tenant.property, function(err, property) {
			if (err)
				return next(err);

			Owner.findById(property.owner, function(err, owner) {
				if (err)
					return next(err);

				Account.findOne({ owner: tenant, validated: true }, function(err, account) {
					if (err)
						return next(err);

					stripe.charges.create({
						amount: req.body.payment.amount * 100,
						currency: 'usd',
						customer: tenant.stripe_customer,
						source: account.token,
						description: 'Rent payment',
						application_fee: 300,
						destination: owner.stripe_id
					},
					function(err, charge) {
						if (err)
							return next(err);

						var payment = new Payment({
							stripe_charge: charge.id,
							amount: charge.amount / 100,
							created: Date(charge.created * 1000),
							source: account,
							property: property
						});
						payment.save();
						res.json(payment);
					});

					/*
					NOTE: Eventually we will probably want to switch back to performing transactions
					on behalf of owners instead of using the destination parameter, so I've left the
					code here, but for the moment it will take too long to get everyone signed up to
					the ACH beta, and using destination seems to be the easiest way around that.

					stripe.tokens.create({
						customer: tenant.stripe_customer,
						bank_account: account.token
					},
					owner.stripe_access,
					function(err, token) {
						if (err)
							return next(err);

						stripe.charges.create({
							amount: req.body.payment.amount * 100,
							currency: 'usd',
							source: token.id,
							description: 'Rent payment',
							application_fee: 300
						},
						owner.stripe_access,
						stripe.charges.create({
							amount: req.body.payment.amount * 100,
							currency: 'usd',
							customer: tenant.stripe_customer,
							source: account.token,
							description: 'Rent payment',
							application_fee: 300,
							destination: owner.stripe_id
						},
						function(err, charge) {
							if (err)
								return next(err);

							var payment = new Payment({
								stripe_charge: charge.id,
								amount: charge.amount / 100,
								created: Date(charge.created * 1000),
								source: account,
								property: property
							});
							payment.save();
							res.json(payment);
						});
					});*/
				});
			});
		});
	});
});

/* Get payment object when a payment param is supplied */
router.param('payment', function(req, res, next, id) {
	var query = Payment.findById(id);
	query.exec(function (err, payment){
		if (err)
			return next(err);
		if (!payment)
			return next(new Error('Can\'t find payment'));

		req.payment = payment;
		return next();
	});
});

module.exports = router;