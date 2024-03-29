var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Payment = mongoose.model('Payment'),
	Tenant = mongoose.model('Tenant'),
	Account = mongoose.model('Account'),
	Property = mongoose.model('Property'),
	Owner = mongoose.model('Owner'),
	Manager = mongoose.model('Manager'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	}),
	twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

/* GET all payments */
router.get('/', auth, function(req, res, next) {
	var filter = {};
	if (req.payload._type == "Tenant")
		filter.payer = req.payload._id;

	Payment.find(filter, function(err, payments){
		if (err)
			return next(err);

		res.json(payments);
	});
});

/* GET specified payment */
router.get('/:payment', auth, function(req, res, next) {
	req.payment.populate('source', function(err, payment) {
		if (err)
			return next(err);

		res.json(payment);
	});
});

/* POST a new payment */
router.post('/', auth, function(req, res, next) {
	if (!req.body.payment || !req.body.payment.amount || req.body.payment.amount == "")
		return res.status(400).json({ message: 'Please provide an amount to pay' });
	if (req.payload._type !== "Tenant")
		return res.status(403).json({ message: 'Only tenants can pay rent on Doorway' });

	Tenant.findById(req.payload._id, function(err, tenant) {
		if (err)
			return next(err);
		if (tenant.current === false || tenant.locked === true)
			return res.status(403).json({ message: 'You are not authorized to pay rent' });
		if (!tenant || !tenant.property || tenant.property == '')
			return next(new Error('Can\'t find property.'));

		Property.findById(tenant.property, function(err, property) {
			if (err)
				return next(err);
			if (!property || !property.owner || property.owner == '')
				return next(new Error('Can\'t find owner.'));

			Owner.findById(property.owner, function(err, owner) {
				if (err)
					return next(err);
				if (!owner || !owner.stripe_id || owner.stripe_id == '')
					return next(new Error('Owner isn\'t correctly set up.'));

				Account.findOne({ owner: tenant, validated: true }, function(err, account) {
					if (err)
						return next(err);
					if (!account || !account.token || account.token == '')
						return next(new Error('Account isn\'t correctly set up.'));

					Manager.findById(tenant.manager, function(err, manager) {
						if (err)
							return next(err);
						if (!manager.verified)
							return res.status(403).json({ message: "Your manager still hasn't been verified.  Please contact them to resolve this issue."});

						// Determine the amount of the fee to be charged
						var fee_amount = 275;
						if (owner.fee_amount !== null && owner.fee_amount < fee_amount)
							fee_amount = owner.fee_amount;
						if (property.fee_amount !== null && property.fee_amount < fee_amount)
							fee_amount = property.fee_amount;
						console.log("Fee: " + fee_amount);

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
								application_fee: fee_amount
							},
							owner.stripe_access,
							function(err, charge) {
								if (err)
									return next(err);

								var payment = new Payment({
									stripe_charge: charge.id,
									amount: charge.amount / 100,
									created: Date(charge.created * 1000),
									source: account,
									property: property,
									payer: tenant,
									owner: owner,
									manager: property.manager
								});
								payment.save();
								res.json(payment);

								// notify Dennis that a payment was made
								twilio.sendMessage({
									to: '2107718253',
									from: '+18019013606',
									body: tenant.getFullName() + ' just paid $' + payment.amount + ' for rent of ' + property.address +'.'
								});

								// notify the manager that a payment was made
								twilio.sendMessage({
									to: manager.phone.replace(/[^0-9]/g, ''),
									from: '+18019013606',
									body: tenant.getFullName() + ' just paid $' + payment.amount + ' for rent of ' + property.address +'.  Please allow 5-7 business days for this payment to arrive.'
								});
							}); // stripe charge create
						}); // stripe token create
					}); // manager
				}); // account
			}); // owner
		}); // property
	}); // tenant
}); // router.post

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
