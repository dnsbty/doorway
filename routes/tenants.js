var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Tenant = mongoose.model('Tenant'),
	Property = mongoose.model('Property'),
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
	req.tenant.email = req.body.email;
	req.tenant.name_first = req.body.name_first;
	req.tenant.name_last = req.body.name_last;
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

/* POST a new tenant */
/*router.post('/:property', auth, function(req, res, next) {
	if (!req.body.email || !req.body.password)
		return res.status(400).json({ message: 'Please fill out all fields' });
	
	var tenant = new Tenant();
	tenant.email = req.body.email;
	tenant.setPassword(req.body.password);
	tenant.property = req.property;

	tenant.save(function(err) {
		if (err)
			return next(err);
		return res.json(tenant);
	});
});*/

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
