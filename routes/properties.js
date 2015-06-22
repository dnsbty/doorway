var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Property = mongoose.model('Property'),
	Tenant = mongoose.model('Tenant'),
	crypto = require('crypto'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all properties */
router.get('/', auth, function(req, res, next) {
	Property.find(function(err, properties){
		if (err)
			return next(err);

		res.json(properties);
	});
});

/* GET specified property */
router.get('/:property', auth, function(req, res) {
	res.json(req.property);
});

/* POST a new property */
router.post('/', auth, function(req, res, next) {
	if (!req.body.address)
		return res.status(400).json({ message: 'Please provide a street address to identify the property' });
	
	var property = new Property(req.body);

	property.save(function(err) {
		if (err)
			return next(err);
		return res.json(property);
	});
});

/* GET list of all tenants in a property */
router.get('/:property/tenants', auth, function(req, res, next) {
	Tenant.find({ '_type' : 'Tenant', current: {$ne: false}}, function(err, tenants){
		if (err)
			return next(err);

		res.json(tenants);
	});
});

/* POST a new tenant to a specific property */
router.post('/:property/tenants', auth, function(req, res, next) {
	if (!req.body.email)
		return res.status(400).json({ message: 'Please fill out all fields' });
	
	var tenant = new Tenant();
	tenant.email = req.body.email;
	tenant.setPassword(crypto.randomBytes(8).toString('hex'));
	tenant.property = req.property;

	tenant.save(function(err) {
		if (err)
			return next(err);
		return res.json(tenant);
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
