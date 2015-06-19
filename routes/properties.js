var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Property = mongoose.model('Property');

/* GET list of all properties */
router.get('/', function(req, res, next) {
	Property.find(function(err, properties){
		if (err)
			return next(err);

		res.json(properties);
	});
});

/* GET specified property */
router.get('/:property', function(req, res) {
	res.json(req.property);
});

/* POST a new property */
router.post('/', function(req, res, next) {
	if (!req.body.address)
		return res.status(400).json({ message: 'Please provide a street address to identify the property' });
	
	var property = new Property(req.body);

	property.save(function(err) {
		if (err)
			return next(err);
		return res.json(property);
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
