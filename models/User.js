var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs'),
	SALT_WORK_FACTOR = 10;

var userSchema = new Schema(
{
	firstname: String,
	lastname: String,
	username: {type: String, unique: true},
	password: String
});

userSchema.pre('save', function(next)
{
	var user = this;

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