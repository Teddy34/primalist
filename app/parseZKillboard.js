var _ = require('lodash');
var fetch = require('node-fetch');

var apiParams = require('../parameters').ZKILLBOARD_PARAMS;
var fetchZKillboard = require('../io/fetchZKillboard');

// functions to analyse losses

var filterDust = function(loss) {
  return (-1 === [351210, 351064].indexOf(loss.groupID));
};

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
  const baseUrl = _.reduce(apiParams.options, reduceURLoptions,apiParams.url);

  const extractentity = function(value, filterKey) {
    return _.map(value, function(filterValue) {
      return {type:filterKey, id: filterValue};
    });
  };

  return fetchZKillboard(_(apiParams.filters).map(addFilter).flatten().value());
};

fetchLossesForOneEntity = (entity) => {
  const baseUrl = _.reduce(apiParams.options, reduceURLoptions,apiParams.url) +
    '/' + entity.type + '/' + entity.id;
  let oldestKill;
  let aggregateResult = [];

  const fetchNext = (partialResult) => {
    if (partialResult === undefined) {
      return fetchZKillboard(baseUrl)
        .then(fetchNext);
    }

    if (partialResult.length >= 0) {
      // 
      aggregateResult = aggregateResult.concat(partialResult);
      return fetchZKillboard(baseUrl+ '/beforeKillID/' + _.last(partialResult).killID)
        .then(fetchNext);
    }

    // no more things to request, end of loop
    return aggregateResult;

  };

};

module.exports =  (function() {
  return Promise.resolve()
  .then(fetchLosses)
  .then(computeLossesForIndustry);
});

function logger(log) {console.log(log); return log;}
function errorlog(log) {consor.error("error"); return Promise.reject(log);}

var reduceURLoptions = function(memo, value, key) {
  return memo + '/' + key + '/' + value;
};