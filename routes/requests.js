var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Request = mongoose.model('Request'),
	Message = mongoose.model('Message'),
	Tenant = mongoose.model('Tenant'),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all maintenance requests */
router.get('/', auth, function(req, res, next) {
	var filter = {};
	if (req.payload._type == "Manager")
		filter.manager = req.payload._id;
	else if (req.payload._type == "Tenant")
		filter.tenant = req.payload._id;
	console.log(filter);

	Request.find(filter)
	.populate({ path: 'property', select: '_id address'})
	.exec(function(err, requests){
		if (err)
			return next(err);

		res.json(requests);
	});
});

/* GET specified maintenance request */
router.get('/:request', auth, function(req, res) {
	req.request.populate('property messages tenant manager', function(err, request) {
		if (err)
			return next(err);

		res.json(request);
	});
});

/* POST a new maintenace request */
router.post('/', auth, function(req, res, next) {
	if (req.payload._type !== "Tenant")
		return res.status(403).json({ message: 'Only tenants may create maintenance requests' });
	if (!req.body.subject || req.body.subject == '')
		return res.status(400).json({ message: 'Please provide a subject to identify your maintenance request' });
	if (!req.body.message || req.body.message == '')
		return res.status(400).json({ message: 'Please provide a message detailing your maintenance request' });

	Tenant.findById(req.payload._id).populate('property manager').exec(function(err, tenant) {
		if (err)
			return next(err);

		var request = new Request({
			property: tenant.property,
			tenant: tenant,
			manager: tenant.manager,
			created: new Date(),
			status: 'open',
			subject: req.body.subject
		});
		var message = new Message({
			sender: tenant,
			recipient: tenant.manager,
			sent: new Date(),
			body: req.body.message
		});

		message.save(function(err) {
			if (err)
				return next(err);

			request.messages.push(message);
			request.save(function(err) {
				if (err)
					return next(err);

				res.json(request).end();

				// send the landlord a notification of the new maintenance request
				mandrill.messages.sendTemplate({
					'template_name': 'maintenance-request',
					'template_content': null,
					'message': {
						'from_email': tenant.email,
						'from_name': tenant.getFullName(),
						'to': [{
							'email': manager.email,
							'name': manager.name_first,
							'type': 'to'
						}],
						'merge_language': 'handlebars',
						'global_merge_vars': [{
							'name': 'manager',
							'content': tenant.manager.name_first
						},{
							'name': 'property',
							'content': tenant.property.address
						},{
							'name': 'tenant',
							'content': tenant.getFullName()
						},{
							'name': 'link',
							'content': process.env.ROOT_NAME + '/#/requests/' + request._id
						}]
					}
				});
			});
		});
	});
});

/* POST new message to a maintenance request */
router.post('/:request/messages', auth, function(req, res) {
	if (req.payload._id != req.request.tenant && req.payload._id != req.request.manager)
		return res.status(403).json({ message: 'Only the tenant and manager involved in this maintenance request can add messages to it.' });
	if (!req.body.message || req.body.message == '')
		return res.status(400).json({ message: 'Please provide a message' });

	// set the correct recipient
	var recipient = req.payload._type == "Tenant" ? req.request.manager : req.request.tenant;

	// set up the message
	var message = new Message({
		sender: req.payload,
		recipient: recipient,
		sent: new Date(),
		body: req.body.message
	});

	// save the message and the request
	message.save(function(err) {
		if (err)
			return next(err);

		req.request.messages.push(message);
		req.request.save(function(err) {
			if (err)
				return next(err);

			req.request.populate('property messages tenant manager', function(err, request) {
				if (err)
					return next(err);

				res.json(request).end();
				if (req.payload._type == "Tenant") {
					var email = {
						from_email: request.tenant.email,
						from_name: request.tenant.getFullName(),
						to_email: request.manager.email,
						to_name: request.manager.getFullName(),
						to_name_first: request.manager.name_first
					};
				} else {
					var email = {
						from_email: request.manager.email,
						from_name: request.manager.getFullName(),
						to_email: request.tenant.email,
						to_name: request.tenant.getFullName(),
						to_name_first: request.tenant.name_first
					};
				}

				// send the landlord a notification of the new maintenance request
				mandrill.messages.sendTemplate({
					'template_name': 'maintenance-request-reply',
					'template_content': null,
					'message': {
						'from_email': email.from_email,
						'from_name': email.from_name,
						'to': [{
							'email': email.to_email,
							'name': email.to_name,
							'type': 'to'
						}],
						'merge_language': 'handlebars',
						'global_merge_vars': [{
							'name': 'sender',
							'content': email.from_name
						},{
							'name': 'subject',
							'content': req.request.subject
						},{
							'name': 'recipient',
							'content': email.to_name_first
						},{
							'name': 'link',
							'content': process.env.ROOT_NAME + '/#/requests/' + request._id
						}]
					}
				});
			});
		});
	});
});

/* Get maintenance request object when a request param is supplied */
router.param('request', function(req, res, next, id) {
	var query = Request.findById(id);
	query.exec(function (err, request){
		if (err)
			return next(err);
		if (!request)
			return next(new Error('Can\'t find maintenance request'));

		req.request = request;
		return next();
	});
});

module.exports = router;
