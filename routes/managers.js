var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Manager = mongoose.model('Manager'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET list of all managers */
router.get('/', auth, function(req, res, next) {
	Manager.find({ '_type' : 'Manager' }, function(err, managers){
		if (err)
			return next(err);

		res.json(managers);
	});
});

/* GET specified manager */
router.get('/:manager', auth, function(req, res) {
	res.json(req.manager);
});

/* GET list of all properties belonging to a manager */
router.get('/:manager/properties', auth, function(req, res, next) {
	req.manager.populate('properties', function(err, manager) {
		if (err)
			return next(err);
		res.json(manager);
	});
})

/* POST a new manager */
router.post('/', function(req, res, next) {
	if (!req.body.email || !req.body.password)
		return res.status(400).json({ message: 'Please fill out all fields' });
	
	var manager = new Manager();
	manager.email = req.body.email;
	manager.setPassword(req.body.password);

	manager.save(function(err) {
		if (err)
			return next(err);
		return res.json(manager);
	});
});

/* Get manager object when a manager param is supplied */
router.param('manager', function(req, res, next, id) {
	var query = Manager.findById(id);
	query.exec(function (err, manager){
		if (err)
			return next(err);
		if (!manager)
			return next(new Error('Can\'t find manager'));

		req.manager = manager;
		return next();
	});
});

module.exports = router;
