var express = require("express");
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var mongourl = 'mongodb://localhost:27017/urls';
var favicon = require('serve-favicon');
var shortid = require('shortid');

app.use(favicon(__dirname + '/public/images/favicon.ico'));

//this is what we will use to find the URL
function findUrl(url) {
  mongo.connect(mongourl, function(err, db) {
    if (err) {
    console.error('There was an error', err);
    return false;
    }
    //this function looks up original URLs to see if they're already in our db
    var urls = db.collection('urls');
    urls.find({ shorturl: url }, function(err, docs) {
        if (err) {
          return 'There was an error returning the urls found in the database!';
        }
        db.close();
        return docs;
      });
    });
}

function insertURL(url){mongo.connect(url, function(err, db) { //this function inserts new original
  if (err) {
    console.error('There was an error setting up the insertURL connection!', err);
    return;
  }
  console.log('inserting ' + url + ' into the database');
  var urls = db.collection('urls');
  urls.insert(url, function(err, data) {
    if (err) {
    console.error('There was an error running the insertURL function!', err);
    return;
  }
    console.log('inserted ' + JSON.stringify(url) + 'into the url database');
    db.close();
  });
});
}


app.post('/new/', jsonParser, function (req, res) {
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
  var str = req.params.url;
  console.log((str));
  if (findUrl(str)){
    console.log('urlString found, redirecting');
    res.redirect(findUrl(str).original);
  }
  else
  {
    res.send('URL not found. Please try with a different URL, or go to '+ req.baseUrl + '/new/ and add a new URL to be shortened.');
  }
});

app.listen(8080, function () {
  console.log('Microservice URL shortener is now listening on port 8080');
});
