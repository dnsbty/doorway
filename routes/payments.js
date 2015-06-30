var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Payment = mongoose.model('Payment'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
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
