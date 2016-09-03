'use strict';

module.exports = function(user, post) {
  for(let i=0; i<user.savedPosts.length; i++) {
    if(user.savedPosts[i].postID === post.postID) {
      return true;
    }
  }
};
