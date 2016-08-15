var express = require("express");
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var mongourl = 'mongodb://localhost:27017/urls';
var favicon = require('serve-favicon');
var shortid = require('shortid');
var Q = require('q');

app.use(favicon(__dirname + '/public/images/favicon.ico'));

//this is what we will use to find the URL
function findUrl(url) {
  var P = Q.defer();
  mongo.connect(mongourl, function(err, db) {
    if (err) {
    console.error('There was an error', err);
    P.reject(err);
    }
    //this function looks up original URLs to see if they're already in our db
    var urls = db.collection('urls');
    urls.findOne({ shorturl: url }, function(err, docs) {
        if (err) {
        P.reject(err);
        }
        P.resolve(docs);
        db.close();
      });
    });
    return P.promise;
}

function insertURL(url){mongo.connect(url, function(err, db) { //this function inserts new original
  var P = Q.defer();
  if (err) {
    console.error('There was an error setting up the insertURL connection!', err);
    P.reject(err);
  }
  console.log('inserting ' + url + ' into the database');
  var urls = db.collection('urls');
  urls.insert(url, function(err, data) {
    if (err) {
    console.error('There was an error running the insertURL function!', err);
    P.reject(err);
  }
    console.log('inserted ' + JSON.stringify(url) + 'into the url database');
    db.close();
    P.resolve();
  });
});
}


app.post('/new/:url', jsonParser, function (req, res) {
  var original = req.body.original;
  var result = {};
  result.original = original;
  result.shorturl = shortid.generate();
  if (insertURL(result)) {
    res.send(result);
  } else {
    res.status(400).send(result);
  }
});

app.get('/:url', function (req, res) {
  var P = Q.defer();
  var str = req.params.url;
  console.log((str));
  findUrl(str)
  .then( function(docs){
     console.log('urlString found, redirecting');
     res.redirect(docs.original);
  })
  .catch(function(err){
      console.error('There was an error redirecting to the original URL:', err);
      P.reject(err);
  });
});

app.listen(8080, function () {
  console.log('Microservice URL shortener is now listening on port 8080');
});
