var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema(
{
	username: String,
  title: String,
  content: String
});

var Post = mongoose.model('post', postSchema);
module.exports = Post;
