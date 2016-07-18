var express = require("express"), accepts = require('accepts');
var app = express();
var useragent = require('useragent');
var sendObj = {'ipAddress':null, 'language':null, 'operatingSystem':null};

app.get(('/whoami'), function (req, res) {
  var accept = accepts(req);
  var agent = useragent.parse(req.headers['user-agent']);
  sendObj.ipAddress = req.ip;
  sendObj.language = accept.languages()[0];
  sendObj.operatingSystem = agent.os.toString();
  res.send(sendObj);
});

app.listen(8080, function () {
  console.log('Microservice request header parser is now listening on port 8080');
});