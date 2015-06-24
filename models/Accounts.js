var mongoose = require('mongoose');

var AccountSchema = new mongoose.Schema({
	token: String,
	bank_name: String,
	last4: String,
	validated: { type: Boolean, default: false },
	created: Date,
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

mongoose.model('Account', AccountSchema);
