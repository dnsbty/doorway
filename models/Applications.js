var mongoose = require('mongoose');

var ApplicationSchema = new mongoose.Schema({
	property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
	submitted: { type: Date, default: Date.now },
	charge: {}
},{ "strict": false });

mongoose.model('Application', ApplicationSchema);