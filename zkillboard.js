var apiUrl = "https://zkillboard.com/api/losses/no-attackers/pastSeconds/604800/corporation/";
var corpIDs = [/* prima */"98161032", /* wise */"98078355"];
var apiParams = require('./zkillboardParams');
var _ = require('lodash');
var fetch = require('node-fetch');

var FETCH_DELAY = 100;

// functions to analyse losses

var reduceLoss = function(memo, loss) {
  //add items
  memo =  _(loss.items).reduce(reduceLostItem,memo);
  addShip(memo, loss);
  return memo;
};

var addShip = function(memo, loss) {
  memo[loss.victim.shipTypeID] = (_.isNumber(memo[loss.victim.shipTypeID])? memo[loss.victim.shipTypeID] : 0) + 1;
  return memo;
};

var reduceLostItem = function (memo, value) {
  memo[value.typeID] = (_.isNumber(memo[value.typeID])? memo[value.typeID] : 0) + value.qtyDropped + value.qtyDestroyed;
  return memo;
};

var convertToObject = function(value, key) {
  return { typeID: key, quantity: value};
};

var computeLossesForIndustry = function(losses) {
  return _.map(_.reduce(losses, reduceLoss, {}), convertToObject);
};

// function to get losses

var fetchLosses = function() {
  var options = {
    method: 'get',
    headers:{
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
  };

  var baseUrl = _.reduce(apiParams.options, reduceURLoptions,apiParams.url);

  var addFilter = function(value, filterKey) {
    return _.map(value, function(filterValue) {
      return baseUrl + '/' + filterKey + '/' + filterValue;
    });
  };

  var doFetch = function(url, options) {
    return fetch(url, options).then(getJSON);
  };

  return Promise.all(_.map(_(apiParams.filters).map(addFilter).flatten().value(), doFetch))
  .then(concatArrays);
};

module.exports =  (function() {
  return Promise.resolve()
  .then(fetchLosses)
  .then(computeLossesForIndustry);
});

function logger(log) {console.log(log);}
function errorlog(log) {consor.error("error");}
function getJSON(response) {
  return response.json();
}

var reduceURLoptions = function(memo, value, key) {
  return memo + '/' + key + '/' + value;
}

function concatArrays(results) {
  return _.reduce(results, function(memo, losses) {
    return memo.concat(losses);
  }, []);
}