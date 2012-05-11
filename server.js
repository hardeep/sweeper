var express = require('express'),
    fs = require('fs');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

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

var host = 'http://localhost';
var port = 3000;

// ----
// ROUTES
// ----

// Simple queue of results coming in 
var results = [];

// Max number of results to keep in memory / show
var max = 5;

// Result template
var tmpl = '<div class="result">{result}</div>';

// Home page template HTML
var html = fs.readFileSync('static/index.html', 'utf-8')
                .split("url = ''").join("url = '" + host + ":" + port + "'")
                .split('max = 0').join('max = ' + max)
                .split("tmpl = ''").join("tmpl = '" + tmpl + "'");


function output(r) {
  if (r.length === 0) {
    return "<h3>No results</h3>";
  } else {
    var resHtml = r.reverse().map(function(t) { return tmpl.split('{result}').join(JSON.stringify(t)); });
    return resHtml.join('');
  }
}

// POST a test result to server
app.post('/result', function(req, res) {
  if (results.length >= max) results.shift();
  var r = req.body;
  results.push(r);
  res.send({success:true});
  io.sockets.emit('result', r);
});

// GET the homepage
app.get('/', function(req, res) {
  res.send(html.split('<!-- RESULTS -->').join(output(results)));
});

app.listen(port);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
