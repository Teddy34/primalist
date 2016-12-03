const express = require('express');
const {throttle} = require('lodash');

const {THROTTLE_DURATION} = require('../parameters');
const {serveAPI, serveHTML} = require('../app/application');

let webServer;

const promisedServeAPI = throttle(serveAPI, THROTTLE_DURATION);
const promisedServeHTML = throttle(serveHTML, THROTTLE_DURATION);

const initServer = (input) => {
  // create the webserver
  webServer = express();

  webServer.get('/api/', (req,res) => {
    Promise.resolve()
    .then(promisedServeAPI)
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send({error:(error && error.stack) ?error.stack : error});
    });
  });
  webServer.get('/', (req,res) => {
    Promise.resolve()
    .then(promisedServeHTML)
    .then((response) => {
      res.send(response);
    })
    .catch((error) => {
      res.send({error:(error && error.stack) ?error.stack : error});
    });
  });
  return input;
};

const logger = (result) => {
  console.log(result);
  return result;
}

const logError = (error) => {
  console.error("error server:", error);
  return promise.reject(error);
}

const startServer = (port) => {
  console.log("Listening to port", port);
  webServer.listen(port);
};

// START THE SERVER
// =============================================================================
module.exports = {
  start: (port) => {
    return Promise.resolve(port)
      .then(initServer)
      .then(startServer);
  }
} 