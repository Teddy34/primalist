var express = require('express');
var _ = require('lodash');

var parameters = require('../parameters');
var application = require('../app/application');

var webServer;


var initServer = function(input) {
  // create the webserver
  webServer = express();

  webServer.get('/api/', function(req,res) {
    Promise.resolve()
    .then(_.throttle(application.serveAPI,parameters.THROTTLE_DURATION))
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      res.send({error:(error && error.stack) ?error.stack : error});
    });
  });
  webServer.get('/', function(req,res) {
    Promise.resolve()
    .then(_.throttle(application.serveHTML,parameters.THROTTLE_DURATION))
    .then(function(response) {
      res.send(response);
    })
    .catch(function(error) {
      res.send({error:(error && error.stack) ?error.stack : error});
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