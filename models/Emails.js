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

EmailSchema.pre('save', function(next) {
    var self = this;

    mongoose.models['Email'].findOne({email : this.email}, 'email', function(err, results) {
        if(err) {
            next(err);
        } else if(results) {
            console.warn('results', results);
            self.invalidate('email', 'Email must be unique');
            err = new Error('This email has already been registered in the system.');
            err.status = 400;
            next(err);
        } else {
            next();
        }
    });
});

mongoose.model('Email', EmailSchema);