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
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
	manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
	tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }]
});

PropertySchema.methods.toJSON = function() {
	var property = this.toObject();
	if (property.applications_open)
		property.application_url = process.env.ROOT_NAME +'/#/applications/' + property._id;
	return property;
};

mongoose.model('Property', PropertySchema);
