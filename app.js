'use strict';

const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

const app = express();

// database setup
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/microblog');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true , uploadDir: __dirname + 'public/uploads'}));
app.use(cookieParser());

//Don't actually use secret in production.
//Use envirionment variable or something
app.use(session({
  secret: "MicroBlog",
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

const routes = require('./routes/index');
const api = require('./routes/api');
app.use('/', routes);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

module.exports = app;
