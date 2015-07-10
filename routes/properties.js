var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Property = mongoose.model('Property'),
	Tenant = mongoose.model('Tenant'),
	Owner = mongoose.model('Owner'),
	crypto = require('crypto'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all properties */
router.get('/', auth, function(req, res, next) {
	var filter = {};
	if (req.payload._type == "Manager")
		filter.manager = req.payload._id;
	else
		return res.status(403).json({ message: 'Only managers may view property lists' });

	Property.find(filter, function(err, properties){
		if (err)
			return next(err);

		res.json(properties);
	});
});

/* GET specified property */
router.get('/:property', auth, function(req, res) {
	// TODO: check for permissions to view property details
	/*if (req.property.manager != req.payload._id && req.property.tenant != req.payload._id)
		return res.status(403).json({ message: 'You don\'t have permission to view this property.' });*/

	req.property.populate('owner', function(err, property) {
		if (err)
			return next(err);

		res.json(property);
	});
});

/* POST a new property */
router.post('/', auth, function(req, res, next) {
	console.log(req.body);
	if (req.payload._type !== 'Manager')
		return res.status(403).json({ message: 'Only managers may create new properties.' });

	if (!req.body.address || req.body.address === '' || !req.body.owner || req.body.owner === '' || !req.body.rent || req.body.rent === '')
		return res.status(400).json({ message: 'Please fill out all fields.' });
	
	var property = new Property(req.body);
	property.manager = req.payload;

	property.save(function(err) {
		if (err)
			return next(err);

		Owner.findById(property.owner, function(err, owner){
			owner.properties.push(property._id);
			owner.save();
			return res.json(property);
		});
	});
});

/* PUT changes to a property */
router.put('/:property', auth, function(req, res) {
	if (req.body.address)
		req.property.address = req.body.address;
	if (req.body.address2)
		req.property.address2 = req.body.address2;
	if (req.body.city)
		req.property.city = req.body.city;
	if (req.body.state)
		req.property.state = req.body.state;
	if (req.body.zip)
		req.property.zip = req.body.zip;
	if (req.body.rent)
		req.property.rent = req.body.rent;
	req.property.save();
	res.json(req.property);
})

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
		tenant.last_login = null;

		stripe.customers.create({
			email: tenant.email
		}, function(err, customer) {
			tenant.stripe_customer = customer.id;
			tenant.save(function(err) {
				if (err)
					return next(err);

				mandrill.messages.sendTemplate({
					'template_name': 'tenant-invite',
					'template_content': null,
					'message': {
						'from_email': req.property.manager.email,
						'from_name': req.property.manager.getFullName(),
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
							'content': req.property.manager.getFullName()
						},{
							'name': 'manager_phone',
							'content': req.property.manager.phone
						},{
							'name': 'link',
							'content': process.env.ROOT_NAME + '/#/newTenant/' + tenant._id + '/' + tenant.hash
						}]
					},
					'async': true
				}, function(result) {
					return res.json(tenant);
				}, function(err) {
					return next(err);
				});
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
