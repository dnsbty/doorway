var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
	sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	sent: Date,
	body: String,
	read: { type: Boolean, default: false },
	readTime: Date
});

MessageSchema.methods.markRead = function () {
	var message = this.toObject();
	message.read = true;
	message.readTime = Date.now;
	return message;
};

mongoose.model('Message', MessageSchema);
