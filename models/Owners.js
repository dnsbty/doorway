var mongoose = require('mongoose'),
	jwt = require('jsonwebtoken');

var OwnerSchema = new mongoose.Schema({
	name: String,
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
	stripe_id: String,
	stripe_public: String,
	stripe_access: String,
	stripe_refresh: String
});

OwnerSchema.methods.toJSON = function() {
	var owner = this.toObject();
	if (!owner.stripe_id || owner.stripe_id == '')
		owner.stripe_connect_url = 'https://connect.stripe.com/oauth/authorize?response_type=code'
			+ '&client_id=' + process.env.STRIPE_CONNECT + '&scope=read_write'
			+ '&state=' + jwt.sign({ owner: this._id }, process.env.JWT_SECRET);
	delete owner.stripe_access;
	delete owner.stripe_refresh;
	return owner;
};

mongoose.model('Owner', OwnerSchema);
