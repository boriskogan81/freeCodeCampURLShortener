var express = require("express");
var mongo = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var app = express();
var mongourl = 'mongodb://localhost:27017/urls';
var favicon = require('serve-favicon');
var shortid = require('shortid');
var Q = require('q');
var config = require('./config');
var base58 = require('./base58.js');
var mongoose = require('mongoose');
var Url = require('./models/url');
var path = require('path');

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/shorten', jsonParser, function (req, res) {
    var longUrl = req.body.url;
    var shortUrl = '';
  
    Url.findOne ({long_url : longUrl}, function(err, doc){
      if (err){
          console.log(err);
        }
      if(doc){
          shortUrl = config.webhost + base58.encode(doc._id);
          res.send({'shortUrl' : shortUrl});
      }
      else{
          var newUrl = Url({
             long_url: longUrl 
          });
          
          newUrl.save(function(err){
              if(err){
              console.log(err);
              }
              shortUrl = config.webhost +base58.encode(newUrl._id);
              res.send({'shortUrl': shortUrl});
          });
      }
  }
  );
});

app.get('/:url', function (req, res) {
    var base58Id = req.params.url;
    var id = base58.decode(base58Id);
    Url.findOne({'_id' : id}, function (err, doc){
        if (err){
        console.log(err);
        }
        if (doc){
            res.redirect(doc.long_url);
        }else{
            res.redirect(config.webhost);
        }
    });
});

app.listen(8080, function () {
  console.log('Microservice URL shortener is now listening on port 8080');
});
