'use strict';

const express = require('express');
const router = express.Router();

// /api routing
router.route('/')
  .get(function(req, res) {
    return res.send('Get request');
  })

  .post(function(req, res) {
    return res.send('Post request');
  });

router.post('/profile', function(req, res) {
  if(!req.user) {
    return res.sendStatus(401);
  }

});

module.exports = router;
