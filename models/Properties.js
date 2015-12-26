var mongoose = require('mongoose');

var PropertySchema = new mongoose.Schema({
	address: String,
	address2: String,
	city: String,
	state: String,
	zip: String,
	rent: Number,
	security_deposit: Number,
	pet_deposit: Number,
	applications_open: Boolean,
	fee_amount: { type: Number, default: null },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }]
});

PropertySchema.methods.toJSON = function() {
	var property = this.toObject();
	if (property.applications_open)
		property.application_url = process.env.ROOT_NAME +'/#/properties/' + property._id + '/apply';
	return property;
};

mongoose.model('Property', PropertySchema);
