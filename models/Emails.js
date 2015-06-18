var mongoose = require('mongoose');

var EmailSchema = new mongoose.Schema({
	email: String,
	datetime: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Email', EmailSchema);