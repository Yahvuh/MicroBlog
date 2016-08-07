'use strict';

const express = require('express');
const router = express.Router();

router.route('/')
  .get(function(req, res) {
    return res.send('Get request');
  })

  .post(function(req, res) {
    return res.send('Post request');
  });

module.exports = router;
