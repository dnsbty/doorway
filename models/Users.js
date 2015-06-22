var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	email: { type: String, lowercase: true, unique: true },
	hash: { type: String, select: false },
	salt: { type: String, select: false },
	name_first: String,
	name_last: String,
	phone: String,
	created: { type: Date, default: Date.now },
	last_login: { type: Date, default: Date.now }
}, {
	collection : 'users',
	discriminatorKey: '_type'
});

UserSchema.methods.setPassword = function(password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
}

UserSchema.methods.validPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
}

UserSchema.methods.generateJWT = function() {
	// set expiration to 60 days
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 60);

	return jwt.sign({
		_id: this._id,
		username: this.username,
		exp: parseInt(exp.getTime() / 1000)
	}, process.env.JWT_SECRET);
};

/* Schema for property managers */
var ManagerSchema = UserSchema.extend({
	properties: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Property'
	}]
});

/* Schema for tenants */
var TenantSchema = UserSchema.extend({
	property : { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
	current: { type: Boolean, default: true },
});

TenantSchema.methods.disable = function(cb) {
	this.current = false;
	this.save(cb);
};
 
mongoose.model('User', UserSchema);
mongoose.model('Manager', ManagerSchema);
mongoose.model('Tenant', TenantSchema);
