'use strict';

const genHandle = function() {
  let handle = '';
  let charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for(let i=0; i < 16; i++) {
    handle += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return handle;
};

module.exports = genHandle;
