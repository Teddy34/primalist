'use strict';

const {
  flatten,
  flow,
  isNumber,
  head,
  last,
  map,
  reduce,
  tap,
  uniqBy
} = require('lodash/fp');
const reduceNoCap = reduce.convert({ 'cap': false });
const mapNoCap = map.convert({ 'cap': false });

const fetch = require('node-fetch');

const {ZKILLBOARD_PARAMS} = require('../parameters');
const fetchZKillboard = require('../io/fetchZKillboard');
const uniqByKillID = uniqBy('killmail_id');

// functions to analyse losses
const reduceLoss = (memo, loss) => {
  //add items
  memo =  reduce(reduceLostItem,memo,loss.victim.items);
  addShip(memo, loss);
  return memo;
};

const addShip = (memo, loss) => {
  memo[loss.victim.ship_type_id] = (isNumber(memo[loss.victim.ship_type_id])? memo[loss.victim.ship_type_id] : 0) + 1;
  return memo;
};

const reduceLostItem = (memo, value) => {
  memo[value.item_type_id] = (isNumber(memo[value.item_type_id])? memo[value.item_type_id] : 0) + (value.quantity_dropped || 0) + (value.quantity_destroyed || 0);
  return memo;
};

const convertToObject = (value, key) => {
  return { typeID: key, quantity: value};
};

const computeLossesForIndustry = flow(reduce(reduceLoss, {}),mapNoCap(convertToObject));

// function to get losses

const fetchLossesForOneEntity = (entity) => {
  const baseUrl = reduceNoCap(reduceURLoptions, ZKILLBOARD_PARAMS.url +
    '/' + entity.type + '/' + entity.id + '/', ZKILLBOARD_PARAMS.options);
  let oldestKill;
  let aggregateResult = [];
  let pageNum = 2;

  const fetchNext = (partialResult) => {
    if (partialResult === undefined) {
      return fetchZKillboard(baseUrl)
        .then(fetchNext);
    }
    if (partialResult.length > 0) {
      //
      aggregateResult = aggregateResult.concat(partialResult);
      return fetchZKillboard(baseUrl + 'page/' + (pageNum++) + '/')
        .then(fetchNext);
    }
    return uniqByKillID(aggregateResult);
    // no more things to request, end of loop
    //return aggregateResult;

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
  return memo + key + '/' + value + '/';
};

module.exports =  (() =>{
  return Promise.resolve(ZKILLBOARD_PARAMS)
  .then(fetchLosses)
  .then(tap(list => console.log('fetchedLosses', list)))
  .then(computeLossesForIndustry);
});