var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Application = mongoose.model('Application'),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* GET specified application */
router.get('/:application', auth, function(req, res) {
	if (req.payload._type !== 'Manager')
		return res.status(403).json({ message: 'Only managers may view applications.' });

	req.application.populate('property', function(err, application) {
		if (err)
			return next(err);
		if (req.payload._id != application.property.manager)
			return res.status(403).json({ message: 'Only the manager of this property may view its lease applications' });

		res.json(application);
	});
});

/* Get application object when an application param is supplied */
router.param('application', function(req, res, next, id) {
	var query = Application.findById(id);
	query.exec(function (err, application){
		if (err)
			return next(err);
		if (!application)
			return next(new Error('Can\'t find application'));

		req.application = application;
		return next();
	});
});

module.exports = router;
