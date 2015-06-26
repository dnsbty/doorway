var mongoose = require('mongoose');

var OwnerSchema = new mongoose.Schema({
	name: String,
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	stripe_id: String,
	stripe_public: String,
	stripe_access: String,
	stripe_refresh: String
});

mongoose.model('Owner', OwnerSchema);
