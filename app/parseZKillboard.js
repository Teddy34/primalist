'use strict';

const {
  flatten,
  flow,
  isNumber,
  head,
  last,
  map,
  reduce,
  tap
} = require('lodash/fp');
const reduceNoCap = reduce.convert({ 'cap': false });
const mapNoCap = map.convert({ 'cap': false });

const fetch = require('node-fetch');

const {ZKILLBOARD_PARAMS} = require('../parameters');
const fetchZKillboard = require('../io/fetchZKillboard');

// functions to analyse losses
const reduceLoss = (memo, loss) => {
  //add items
  memo =  reduce(reduceLostItem,memo,loss.items);
  addShip(memo, loss);
  return memo;
};

const addShip = (memo, loss) => {
  memo[loss.victim.shipTypeID] = (isNumber(memo[loss.victim.shipTypeID])? memo[loss.victim.shipTypeID] : 0) + 1;
  return memo;
};

const reduceLostItem = (memo, value) => {
  memo[value.typeID] = (isNumber(memo[value.typeID])? memo[value.typeID] : 0) + value.qtyDropped + value.qtyDestroyed;
  return memo;
};

const convertToObject = (value, key) => {
  return { typeID: key, quantity: value};
};

const computeLossesForIndustry = flow(reduce(reduceLoss, {}),mapNoCap(convertToObject));

// function to get losses

const fetchLossesForOneEntity = (entity) => {
  const baseUrl = reduceNoCap(reduceURLoptions, ZKILLBOARD_PARAMS.url +
    '/' + entity.type + '/' + entity.id, ZKILLBOARD_PARAMS.options);
  let oldestKill;
  let aggregateResult = [];

  const fetchNext = (partialResult) => {
    if (partialResult === undefined) {
      return fetchZKillboard(baseUrl + '/')
        .then(fetchNext);
    }

    if (partialResult.length > 0) {
      //
      aggregateResult = aggregateResult.concat(partialResult);
      return fetchZKillboard(baseUrl + '/beforeKillID/' + last(partialResult).killID + '/')
        .then(fetchNext);
    }

  console.log("result final", aggregateResult.length); 
    // no more things to request, end of loop
    return aggregateResult;

  };

  return fetchNext();
};

const fetchLosses = ({filters}) => {
  const extractEntity = (value, filterKey) => {
    return map((filterValue) => {
      return {type:filterKey, id: filterValue};
    }, value)
  };

    flow(
      mapNoCap(extractEntity),
      flatten,
      head
    )(filters)

  return flow(
    mapNoCap(extractEntity),
    flatten,
    head,
    fetchLossesForOneEntity
    )(filters);
};

const reduceURLoptions = (memo, value, key) => {
  return memo + '/' + key + '/' + value;
};

module.exports =  (() =>{
  return Promise.resolve(ZKILLBOARD_PARAMS)
  .then(fetchLosses)
  .then(computeLossesForIndustry);
});