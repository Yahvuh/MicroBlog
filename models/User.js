var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs'),
	SALT_WORK_FACTOR = 10;

var userSchema = new Schema(
{
	/*
		name:
		{
			first: {type: String: required: true},
			last: {type: String: required: true}
		}
	*/

	firstname: String,
	lastname: String,
	username: {type: String, index: {unique: true}},
	password: String,
	createdAt: {type: Date, default: Date.now},
	timeString: String,
	following: [],
	followers: []
});

userSchema.pre('save', function(next)
{
	var user = this;
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var date = new Date();
	user.createdAt = new Date();
	user.timeString = months[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear() + " at " + date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2);

	if(!user.isModified('password'))
	{
		return next();
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt)
	{
		if(err)
		{
			return next(err);
		}

		bcrypt.hash(user.password, salt, function(err, hash)
		{
			if(err)
			{
				return next(err);
			}

			user.password = hash;
			next();
		});
	});
});

userSchema.methods.comparePassword = function(candidatePassword, callback)
{
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch)
	{
		if(err)
		{
			return callback(err);
		}
		callback(undefined, isMatch);
	});
}

var User = mongoose.model('user', userSchema);
module.exports = User;
