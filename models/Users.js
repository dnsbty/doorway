var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	email: { type: String, lowercase: true, unique: true },
	hash: String,
	salt: String,
	name_first: String,
	name_last: String,
	phone: String,
	created: { type: Date, default: Date.now },
	last_login: { type: Date, default: Date.now },
	onboarding: { type: Boolean, default: true }
}, {
	collection : 'users',
	discriminatorKey: '_type'
});

UserSchema.methods.setPassword = function(password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
	return this.hash === hash;
};

UserSchema.methods.toJSON = function() {
	var user = this.toObject();
	delete user.hash;
	delete user.salt;
	return user;
};

UserSchema.methods.generateJWT = function() {
	// set expiration to 60 days
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 1);

	return jwt.sign({
		_id: this._id,
		_type: this._type,
		exp: parseInt(exp.getTime() / 1000)
	}, process.env.JWT_SECRET);
};

UserSchema.methods.getFullName = function() {
	return this.name_first + ' ' + this.name_last;
};

UserSchema.methods.loginToken = function() {
	var today = new Date();
	today.setHours(0,0,0,0);
	return crypto.pbkdf2Sync(today + this.id, this.salt, 1000, 64).toString('hex');
};

/* Schema for property managers */
var ManagerSchema = UserSchema.extend({
	verified: { type: Boolean, default: false },
	multiple_owners: { type: Boolean, default: true },
	owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }],
	properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
	tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
	application_fee: { type: Number, default: 30 },
	stripe_id: String,
	stripe_public: String,
	stripe_access: String,
	stripe_refresh: String
});

ManagerSchema.methods.toJSON = function() {
	var manager = this.toObject();
	if (!manager.stripe_id || manager.stripe_id == '')
		manager.stripe_connect_url = 'https://connect.stripe.com/oauth/authorize?response_type=code'
			+ '&client_id=' + process.env.STRIPE_CONNECT + '&scope=read_write'
			+ '&state=' + jwt.sign({ owner: this._id }, process.env.JWT_SECRET)
			+ '&redirect_uri=' + encodeURIComponent(process.env.ROOT_NAME + '/#/managers/connect')
			+ '&stripe_user[email]=' + manager.email
			+ '&stripe_user[url]=' + encodeURIComponent(process.env.ROOT_NAME)
			+ '&stripe_user[phone_number]=' + manager.phone
			+ '&stripe_user[first_name]=' + manager.name_first
			+ '&stripe_user[last_name]=' + manager.name_last
			+ '&stripe_user[physical_product]=true&stripe_user[country]=US&stripe_user[currency]=usd'
			+ '&stripe_user[product_category]=other&stripe_user[average_payment]=50'
			+ '&stripe_user[product_description]=' + encodeURIComponent('Property management services');
	return manager;
}

/* Schema for tenants */
var TenantSchema = UserSchema.extend({
	property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	current: { type: Boolean, default: true },
	locked: { type: Boolean, default: false },
	stripe_customer: String,
	autopay: { type: Boolean, default: false },
	default_account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
});

TenantSchema.methods.disable = function(cb) {
	this.current = false;
	this.save(cb);
};
 
mongoose.model('User', UserSchema);
mongoose.model('Manager', ManagerSchema);
mongoose.model('Tenant', TenantSchema);
