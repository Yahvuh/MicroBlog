'use strict';

const genPID = function() {
  let pid = '';
  let charset = '0123456789';

  for(let i=0; i < 16; i++) {
    pid += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return pid;
};

module.exports = genPID;
