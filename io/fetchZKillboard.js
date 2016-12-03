const _ = require('lodash');
const fetch = require('node-fetch');

const parameters = require('../parameters');

const getJSON = (response) => {
  return response.json();
}

const log = (result) => {
	console.log(result);
	return result;
}

const promisedThrottle = (func, duration) => {
  // pool management
  const pool = [];

  const removeFromPool = () => {
    if (pool.length) {
      pool.shift()();
    }
  };

  const addToPool = (input) => {
    const promise = new Promise((resolve, reject) => {
        pool.push(() => resolve(input));
    });
    //return the result of the call;
    return promise.then(func);
  };

  setInterval(removeFromPool, duration);
  return addToPool;
}

// function to get losses

module.exports = promisedThrottle((url) => {
  console.log("fetching data from zkillboard", url);
  const options = {
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