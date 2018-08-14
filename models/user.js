var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var uniqueValidator = require('mongoose-unique-validator');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String,
		unique: true
	},
	name: {
		type: String
	},
	profileimage: {
		type: String
	},
	secretToken: {
		type: String
	}, active: {
		type: Boolean
	},
	age: {
		type: Number
	},
	height: {
		type: Number
	},
	politics: {
		type: String
	},
	social: {
		type: String
	}
});

UserSchema.plugin(uniqueValidator);

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		callback(null, isMatch);
	});
}



module.exports.createUser = function(newUser, callback){
		bcrypt.genSalt(10, function(err, salt) {
    	bcrypt.hash(newUser.password, salt, function(err, hash) {
					newUser.password = hash;
        	newUser.save(callback);
    	});
	});
}
