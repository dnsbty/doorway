var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Property = mongoose.model('Property'),
	Tenant = mongoose.model('Tenant'),
	Owner = mongoose.model('Owner'),
	Application = mongoose.model('Application'),
	crypto = require('crypto'),
	stripe = require('stripe')(process.env.STRIPE_SECRET),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	}),
	twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

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
router.get('/:property', function(req, res) {
	// TODO: find a way to use the middleware function here only when applications aren't open
	/*if (!req.property.applications_open)
	{
		if (req.payload._type == "Manager" && req.payload._id != req.property.manager)
			return res.status(403).json({ message: 'Only the manager of this property may view its details' });
		else if (req.payload._type == "Tenant" && req.property.tenants.indexOf(req.payload._id) != -1)
			return res.status(403).json({ message: 'Only the current tenant of this property may view its details' });
	}*/

	req.property.populate('owner tenants', function(err, property) {
		if (err)
			return next(err);

		res.json(property);
	});
});

/* POST a new property */
router.post('/', auth, function(req, res, next) {
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
	if (req.payload._id != req.property.manager)
		return res.status(403).json({ message: 'Only the manager of this property may make changes to it' });

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
	if (req.payload._id != req.property.manager)
		return res.status(403).json({ message: 'Only the manager of this property may view tenants in it' });

	Tenant.find({ '_type' : 'Tenant', current: {$ne: false}, property: req.property._id}, function(err, tenants){
		if (err)
			return next(err);

		res.json(tenants);
	});
});

/* POST a new tenant to a specific property */
router.post('/:property/tenants', auth, function(req, res, next) {
	if (req.payload._id != req.property.manager)
		return res.status(403).json({ message: 'Only the manager of this property may add tenants to it' });

	if (!req.body.email || !req.body.name_first)
		return res.status(400).json({ message: 'Please fill out all fields' });
	
	// grab the manager info
	req.property.populate('manager', function(err, post) {
		if (err)
			return next(err);
	
		// set the new tenant info from the request body
		var tenant = new Tenant();
		tenant.email = req.body.email;
		tenant.name_first = req.body.name_first;
		tenant.setPassword(crypto.randomBytes(8).toString('hex'));
		tenant.property = req.property;
		tenant.manager = req.property.manager;
		tenant.last_login = null;

		// add in optional info if it was passed in
		if (req.body.name_last)
			tenant.name_last = req.body.name_last;
		if (req.body.phone)
			tenant.phone = req.body.phone;

		// create a new customer in stripe with the tenant info
		stripe.customers.create({
			email: tenant.email
		}, function(err, customer) {
			tenant.stripe_customer = customer.id;

			// save the tenant to the database
			tenant.save(function(err) {
				if (err)
					return next(err);

				// add the tenant to the list of tenants in the property
				req.property.tenants.push(tenant._id);
				req.property.save(function(err) {
					if (err)
						return next(err);

					// send the invitation to the tenant
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
});

/* GET all applications for a property */
router.get('/:property/applications', auth, function(req, res, next) {
	if (req.payload._id != req.property.manager)
		return res.status(403).json({ message: 'Only the manager of this property may view applications for it' });

	Application.find({property: req.property._id}, function(err, applications){
		if (err)
			return next(err);

		res.json(applications);
	});
});

/* PUT application status change */
router.put('/:property/applications', auth, function(req, res, next) {
	if (req.property.manager != req.payload._id)
		return res.status(403).json({ message: 'Only the manager of this property may open applications for it' });

	req.property.populate('owner tenants', function(err, property) {
		if (err)
			return next(err);

		req.property.applications_open = req.body.applications_open;
		req.property.save();
		res.json(property);
	});
});

/* POST new application for a property */
router.post('/:property/applications', function(req, res, next) {
	req.property.populate('manager owner', function(err, property) {
		if (err)
			return next(err);

		var application = Application(req.body);
		application.property = req.property._id;
		application.save();

		// charge the application fee to the provided card
		stripe.charges.create({
			amount: property.manager.application_fee * 100,
			currency: 'usd',
			source: application.card,
			description: 'Application fee for ' + property.address,
			application_fee: 500,
			destination: property.owner.stripe_id
		}, function(err, charge) {
			if (err)
				return next(err);

			// save the charge data with the application to the database
			application.charge = charge;
			application.save();
			res.json(application);
			res.end();

			// notify Dennis that an application was received
			twilio.sendMessage({
				to: '2107718253',
				from: '+18019013606',
				body: 'Just received an application for ' + req.property.address
			});

			// notify the manager that a payment was made
			twilio.sendMessage({
				to: property.manager.phone.replace(/[^0-9]/g, ''),
				from: '+18019013606',
				body: 'An application was just received for ' + property.address
			});
		});
	});
});

/* POST new application invitation */
router.post('/:property/applications/invite', auth, function(req, res, next) {
	if (req.payload._id != req.property.manager)
		return res.status(403).json({ message: 'Only the manager of this property may invite applicants to it' });
	console.log(req.body);
	req.property.populate('manager', function(err, property) {
		if (err)
			return next(err);

		if (req.body.type == "text") {
			// send a text message with a link to the application
			twilio.sendMessage({
				to: req.body.number.replace(/[^0-9]/g, ''),
				from: '+18019013606',
				body: 'Application to lease ' + property.address + ':\n' + process.env.ROOT_NAME +'/#/properties/' + property._id + '/apply'
			});
			res.json({ message: 'The application invitation has been sent.' });
		} else if (req.body.type == "email") {
			res.status(503).json({ message: 'The system for emailing application invitations is under construction.  Please invite via text message or send an email manually until this is working.' });
			// send an email with a link to the application

			// TODO: create an email template for invitations

			/*mandrill.messages.sendTemplate({
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
			});*/
		} else {
			return res.status(400).json({ message: 'A message type must be specified' });
		}
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
