var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema(
{
	username: String,
	title: { type: String, index: { unique: true }},
	urlTitle: { type: String, index: { unique: true }},
	content: String,
	createdAt: { type: String, default: Date.now },
	timeString: String
});

postSchema.pre('save', function(next)
{
	var post = this;
	var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var date = new Date();
	post.createdAt = date;
	post.timeString = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

	if(!post.isModified('title'))
		return next();

	next();
});

var Post = mongoose.model('post', postSchema);
module.exports = Post;
