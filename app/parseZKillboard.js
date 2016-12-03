'use strict';

const _ = require('lodash');
const fetch = require('node-fetch');

const apiParams = require('../parameters').ZKILLBOARD_PARAMS;
const fetchZKillboard = require('../io/fetchZKillboard');

// functions to analyse losses

const filterDust = (loss) => {
  return (-1 === [351210, 351064].indexOf(loss.groupID));
};

const reduceLoss = (memo, loss) => {
  //add items
  memo =  _(loss.items).reduce(reduceLostItem,memo);
  addShip(memo, loss);
  return memo;
};

const addShip = (memo, loss) => {
  memo[loss.victim.shipTypeID] = (_.isNumber(memo[loss.victim.shipTypeID])? memo[loss.victim.shipTypeID] : 0) + 1;
  return memo;
};

const reduceLostItem = (memo, value) => {
  memo[value.typeID] = (_.isNumber(memo[value.typeID])? memo[value.typeID] : 0) + value.qtyDropped + value.qtyDestroyed;
  return memo;
};

const convertToObject = (value, key) => {
  return { typeID: key, quantity: value};
};

const computeLossesForIndustry = (losses) => {
  console.log('computeLossesForIndustry', losses.length);
  return _.map(_.reduce(losses, reduceLoss, {}), convertToObject);
};

// function to get losses

const fetchLossesForOneEntity = (entity) => {
  const baseUrl = _.reduce(apiParams.options, reduceURLoptions,apiParams.url) +
    '/' + entity.type + '/' + entity.id;
  let oldestKill;
  let aggregateResult = [];

  const fetchNext = (partialResult) => {
    if (partialResult === undefined) {
      return fetchZKillboard(baseUrl)
        .then(fetchNext);
    }

    if (partialResult.length > 0) {
      //
      aggregateResult = aggregateResult.concat(partialResult);
      return fetchZKillboard(baseUrl+ '/beforeKillID/' + _.last(partialResult).killID)
        .then(fetchNext);
    }

  console.log("result final", aggregateResult.length); 
    // no more things to request, end of loop
    return aggregateResult;

  };

  return fetchNext();
};

const fetchLosses = () => {
  const baseUrl = _.reduce(apiParams.options, reduceURLoptions,apiParams.url);

  const extractEntity = (value, filterKey) => {
    return _.map(value, (filterValue) => {
      return {type:filterKey, id: filterValue};
    });
  };

  return fetchLossesForOneEntity(_(apiParams.filters).map(extractEntity).flatten().head());
};

const logger = (log) => {console.log(log); return log;}
const errorlog = (log) => {console.error("error"); return Promise.reject(log);}

const reduceURLoptions = (memo, value, key) => {
  return memo + '/' + key + '/' + value;
};

module.exports =  (() =>{
  return Promise.resolve()
  .then(fetchLosses)
  .then(computeLossesForIndustry);
});