var _ = require('lodash');
var fetch = require('node-fetch');

var parameters = require('../parameters');

// function to get losses

module.exports = function get(url) {
  var options = {
    method: 'get',
    headers:{
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json',
        'User-Agent': parameters.USER_AGENT
      }
  };

  return fetch(url, options).then(getJSON);
};

function getJSON(response) {
  return response.json();
}

function log(result) {
	console.log(result);
	return result;
}