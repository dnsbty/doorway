var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
	property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
	tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	created: Date,
	status: String,
	subject: String,
	messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

mongoose.model('Request', RequestSchema);
