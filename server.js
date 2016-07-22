var express = require("express");
var mongo = require('mongodb').MongoClient;
var app = express();
var url = 'mongodb://localhost:27017/urls';
var count = 0;
function counts(err, x){
  if (err)throw err;
  return parseInt(x.count());
}

;
//this is what we will use to increment the new URL number
function findUrl(x) {mongo.connect(url, function(err, db) { //this function looks up original URLs to see if they're already in our db
  console.log('finding ' + x + ' in the database');
  if (err) {
    console.error('There was an error finding ' + x + ' in the database!', err);
    return;
  }
  var urls = db.collection('urls');
  count = counts(urls);
  console.log(count + ' entries in the url database');
  //every time we look up a new original URL, we will update the count to the length of the 'urls' collection
  urls.find({originalUrl:'x'
  }).toArray(function(err, docs) {
    if (err) {
    console.error('There was an error returning the urls found in the database!', err);
    return;
    }
    db.close();
    return docs;
    });
});
}

function insertURL(x){mongo.connect(url, function(err, db) { //this function inserts new original
  if (err) {
    console.error('There was an error setting up the insertURL connection!', err);
    return;
  }
  console.log('inserting ' + x + ' into the database');
  var urls = db.collection('urls');
  urls.insert(x, function(err, data) {
    if (err) {
    console.error('There was an error running the insertURL function!', err);
    return;
  }
    console.log('inserted ' + JSON.stringify(x) + 'into the url database');
    db.close();
  });
});
}

var sendObj = {'originalUrl':null, 'newUrl':null};

app.get('/new/:url*', function (req, res) {
  var str = req.url;
  str = str.slice(5);
  console.log((str));
  sendObj.originalUrl = str;
  if (findUrl(str)){
    sendObj.newUrl = findUrl(str).newUrl;
    console.log('url exists in db');
  }
  else
  {
    sendObj.newUrl = parseInt(req.baseUrl + (count + 1));
    insertURL(sendObj);
  }
  res.send(sendObj);
});

app.get(('/:url'), function (req, res) {
  var str = req.params.url;
  console.log((str));
  if (findUrl(str)){
    console.log('urlString found, redirecting');
    res.redirect(findUrl(str).originalUrl);
  }
  else
  {
    res.send('URL not found. Please try with a different URL, or go to '+ req.baseUrl + '/new/ and add a new URL to be shortened.');
  }
});

app.listen(8080, function () {
  console.log('Microservice URL shortener is now listening on port 8080');
});
