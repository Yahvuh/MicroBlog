var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema(
{
	username: String,
  title: {type: String, index: {unique: true}},
	urlTitle: {type: String, index: {unique: true}},
  content: String
});

postSchema.pre('save', function(next)
{
	var post = this;
	console.log('checking')

	if(!post.isModified('title'))
	{
		console.log('Not Modified');
		//return next();
	}

});


var Post = mongoose.model('post', postSchema);
module.exports = Post;
