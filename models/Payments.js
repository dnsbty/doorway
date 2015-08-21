var mongoose = require('mongoose');

var PaymentSchema = new mongoose.Schema({
	stripe_charge: String,
	amount: Number,
	created: Date,
	payer: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
	source: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
	property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }
});

mongoose.model('Payment', PaymentSchema);
