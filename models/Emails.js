var mongoose = require('mongoose');

var EmailSchema = new mongoose.Schema({
	email: { 
		type: String,
		lowercase: true,
		unique: true
	},
	datetime: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Email', EmailSchema);