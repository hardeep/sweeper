var express = require('express');

var app = module.exports = express.createServer();

// Express Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// ----
// ROUTES
// ----

// Simple queue of results coming in 
var results = [];

// POST a test result to server
app.post('/result', function(req, res) {
  if (results.length >= 20) results.shift();
  results.push(req.body);
  res.send({success:true});
});

// GET the homepage
app.get('/', function(req, res) {
});

app.listen(3000);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
