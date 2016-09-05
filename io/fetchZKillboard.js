var _ = require('lodash');
var fetch = require('node-fetch');

var parameters = require('../parameters');

// function to get losses

module.exports = promisedThrottle(function get(url) {
  console.log("fetching data from zkillboard", url);
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
}, 300);

function getJSON(response) {
  return response.json();
}

function log(result) {
	console.log(result);
	return result;
}

function promisedThrottle(func, duration) {
  // pool management
  var pool = [];

  var removeFromPool = function() {
    if (pool.length) {
      pool.shift()();
    }
  };

  var addToPool = function(input) {
    var promise = new Promise(function(resolve, reject) {
        pool.push(function(){resolve(input);});
    });
    //return the result of the call;
    return promise.then(func);
  };

  setInterval(removeFromPool, duration);
  return addToPool;
}