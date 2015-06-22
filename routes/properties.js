var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Property = mongoose.model('Property'),
	Tenant = mongoose.model('Tenant'),
	crypto = require('crypto'),
	mandrill = require('mandrill-api/mandrill').Mandrill(process.env.MANDRILL_KEY),
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
	property.manager = req.payload;

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
	if (!req.body.email || !req.body.name_first)
		return res.status(400).json({ message: 'Please fill out all fields' });
	
	req.property.populate('manager', function(err, post) {
		if (err)
			return next(err);
	
		var tenant = new Tenant();
		tenant.email = req.body.email;
		tenant.name_first = req.body.name_first;
		tenant.setPassword(crypto.randomBytes(8).toString('hex'));
		tenant.property = req.property;

		tenant.save(function(err) {
			if (err)
				return next(err);

			mandrill.messages.sendTemplate({
				'template_name': 'tenant-invite',
				'message': {
					'from_email': req.property.manager.email,
					'from_name': req.property.manager.getFullName(),
					'to': [{
						'email': tenant.email,
						'name': tenant.name_first,
						'type': 'to'
					}],
					'headers': {
						'Reply-To': 'dennis@doorwayapp.com'
					},
					'merge_language': 'handlebars',
					'global_merge_vars': [{
						'name': 'tenant_name',
						'content': tenant.name_first
					},{
						'name': 'landlord_name',
						'content': req.property.manager.getFullName()
					},{
						'name': 'landlord_phone',
						'content': req.property.manager.phone
					},{
						'name': 'link',
						'content': 'https://doorwayapp.com'
					}]
				},
				'async': true
			}, function(result) {
				return res.json(tenant);
			}, function(err) {
				console.log('A mandrill error occurred: ' + err.name + ' - ' + err.message);
				return next(err);
			});
		});
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
