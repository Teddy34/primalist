var express = require('express');
var _ = require('lodash');

var application = require('../app/application');

var THROTTLE_DURATION = 5 * 60 * 1000;

var webServer;


var initServer = function(input) {
  // create the webserver
  webServer = express();

  webServer.use('/api/', function(req,res) {
    Promise.resolve()
    .then(_.throttle(application.serveAPI,THROTTLE_DURATION))
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      res.send({error:error});
    });
  });
  webServer.use('/', function(req,res) {
    Promise.resolve()
    .then(_.throttle(application.serveHTML,THROTTLE_DURATION))
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      if (error && error.stack) {console.log(error.stack)};
      res.send({error:error});
    });
  });
  return input;
};

var startServer = function(port) {
  console.log("Listening to port", port);
  webServer.listen(port);
};

// START THE SERVER
// =============================================================================
module.exports = {
  start: function(port) {
    return Promise.resolve(port)
      .then(initServer)
      .then(startServer);
  }
} 

function logger(result) {
  console.log(result);
  return result;
}

function logError(error) {
  console.error("error server:", error);
  return promise.reject(error);
}