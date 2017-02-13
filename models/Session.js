 // grab the packages that we need for the user model
 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;
 var bcrypt = require('bcrypt-nodejs');

 // user schema
 var SessionSchema = new Schema({
 	token: { type: String, required: true, index: { unique: true }},
 	type: { type: String, required: true, select: false },
 	oauth_Token: { type: String, required: false, select: false },
 	user_id: { type: String, required: false, select: false },
 	active: { type: String, required: true, select: false },
 });


// method to compare a given password with the database hash
SessionSchema.methods.comparePassword = function(password) { 
	var user = this;
	return bcrypt.compareSync(password, user.password);
};

// return the model
module.exports = mongoose.model('Session', SessionSchema);

