var express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  passport = require('passport');

// load environment variables
var env = require('node-env-file');
env(__dirname + '/.env');

// models and db connection
require('./models/Users');
require('./models/Owners');
require('./models/Properties');
require('./models/Accounts');
require('./models/Emails');
require('./models/Payments');
mongoose.connect('mongodb://localhost/doorway');

// config files
require('./config/passport');

// routes
var routes = require('./routes/index'),
  users = require('./routes/users'),
  managers = require('./routes/managers'),
  tenants = require('./routes/tenants'),
  owners = require('./routes/owners'),
  properties = require('./routes/properties'),
  accounts = require('./routes/accounts'),
  payments = require('./routes/payments');

var app = express();
app.set('env', process.env.NODE_ENV);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);
app.use('/managers', managers);
app.use('/tenants', tenants);
app.use('/owners', owners);
app.use('/properties', properties);
app.use('/accounts', accounts);
app.use('/payments', payments);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).send({status: err.status || 500, message: err.message, stack: err.stack});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).send({status:500, message: err.message, type:'internal'});
});


module.exports = app;
