var express = require("express");
var mongo = require('mongodb').MongoClient;
var app = express();
var url = 'mongodb://localhost:27017/urls';

var count;
//this is what we will use to increment the new URL number
function findUrl(x) {mongo.connect(url, function(err, db) { //this function looks up original URLs to see if they're already in our db
      if (err) throw err;
  var urls = db.collection('urls');
  count = parseInt(urls.count());
  //every time we look up a new original URL, we will update the count to the length of the 'urls' collection
  urls.find({originalUrl:'x'
  }).toArray(function(err, docs) {
    if (err) throw err;
    db.close();
    return docs;
    });
});
}

function insertURL(x){mongo.connect(url, function(err, db) { //this function inserts new original
      if (err) throw err;
  var urls = db.collection('urls');
  urls.insert(x, function(err, data) {
    if (err) throw err;
    console.log(JSON.stringify(x));
    db.close();
  });
});
}

var sendObj = {'originalUrl':null, 'newUrl':null};

app.get('/new/:url', function (req, res) {
  var str = req.query.url;
  console.log((str));
  sendObj.originalUrl = str;
  if (findUrl(str)){
    sendObj.newUrl = findUrl(str).newUrl;
  }
  else
  {
    sendObj.newUrl = req.baseUrl + (count + 1);
    insertURL(sendObj);
  }
  res.send(sendObj);
});

app.get(('/:url'), function (req, res) {
  var str = req.params.url;
  console.log((str));
  if (findUrl(str)){
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
