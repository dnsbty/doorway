var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	passport = require('passport'),
	mandrill_lib = require('mandrill-api/mandrill'),
	mandrill = new mandrill_lib.Mandrill(process.env.MANDRILL_KEY),
	jwt = require('express-jwt'),
	auth = jwt({
		secret: process.env.JWT_SECRET,
		userProperty: 'payload'
	});

/* POST new login */
router.post('/login', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields'});
	}

	passport.authenticate('local', function(err, user, info){
		if(err){ return next(err); }

		if(user){
			if (user._type == 'Manager') {
				user.populate('owners', 'name', function(err, manager) {
					if (err)
						return next(err);

					res.json({
						user: manager,
						token: manager.generateJWT()
					});
				});
			} else if (user._type == 'Tenant') {
				user.populate('property', function(err, tenant) {
					if (err)
						return next(err);

					res.json({
						user: tenant,
						token: tenant.generateJWT()
					});
				})
			} else {
				res.json({
					user: user,
					token: user.generateJWT()
				});
			}
		} else {
			return res.status(401).json(info);
		}
	})(req, res, next);
});

/* POST forgot password incident */
router.post('/:email/password/reset', function(req, res, next) {
	User.findOne({email: req.params.email}, function (err, user){
		if (err)
			return next(err);
		if (!user)
			return next(new Error('A user with this email address wasn\'t found'));
		
		// send the password reset link to the user
		mandrill.messages.sendTemplate({
			'template_name': 'password-reset',
			'template_content': null,
			'message': {
				'to': [{
					'email': user.email,
					'name': user.getFullName(),
					'type': 'to'
				}],
				'merge_language': 'handlebars',
				'global_merge_vars': [{
					'name': 'tenant_name',
					'content': user.name_first
				},{
					'name': 'link',
					'content': process.env.ROOT_NAME + '/#/resetPassword/' + user._id + '/' + user.loginToken()
				}]
			}
		}, function(result) {
			console.log(result);
			return res.json({message: "The password reset email was sent successfully"});
		}, function(err) {
			return next(err);
		});
	});
});

/* PUT change password */
router.put('/:user/password', function(req, res, next) {
	if (req.body.token != req.user.loginToken())
		return res.status(401).json({ message: 'You don\'t have permission to edit the password of this user' });
	if(!req.body.password)
		return res.status(400).json({message: 'Please fill out all fields'});

	req.user.setPassword(req.body.password);
	req.user.save();
	res.json(req.user);
});

/* GET list of all users */
/*router.get('/', auth, function(req, res, next) {
	User.find(function(err, posts){
		if (err)
			return next(err);

		res.json(posts);
	});
});*/

/* Get user object when a user param is supplied */
router.param('user', function(req, res, next, id) {
	var query = User.findById(id);
	query.exec(function (err, user){
		if (err)
			return next(err);
		if (!user)
			return next(new Error('User wasn\'t found'));

		req.user = user;
		return next();
	});
});

module.exports = router;
