var mongoose = require('mongoose');

var PropertySchema = new mongoose.Schema({
	address: String,
	address2: String,
	city: String,
	state: String,
	zip: String,
	rent: Number,
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }]
});

mongoose.model('Property', PropertySchema);
