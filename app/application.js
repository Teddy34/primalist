const {
  flow,
  partial,
  map,
  difference,
  filter,
  zip,
  toNumber,
  sortBy
} = require('lodash/fp');

const template = require('./UITable');
const parseZKillboard = require('./parseZKillboard');
const {getItems} = require('../io/eveSDE');

const mergeToOneObject = (arr) => Object.assign({}, ...arr)

const forceTypeNumber = (elem) => {
  elem.groupID = toNumber(elem.groupID);
  elem.typeID = toNumber(elem.typeID);
  return elem;
};

const filterEveOnlyAndMarket = (elem) => {
  return ((elem.groupID < 100000) && (elem.marketGroupID !== null));
};

const decorateFromSDE = (itemList) => {
  const parse = (eveSDEItems) => {
    const myItemIDs = map('typeID', itemList);
    const sdeItemIDs = map('typeID', eveSDEItems.rows).map((nId) => String(nId));
    const diff = difference(myItemIDs, sdeItemIDs); // list not found items
    const myFilteredItemList = filter((item) => (diff.indexOf(item.typeID) === -1), itemList);

    return flow(
      zip(myFilteredItemList),
      map(mergeToOneObject),
      map(forceTypeNumber),
      filter(filterEveOnlyAndMarket)
      )(eveSDEItems.rows);
  }

  return Promise.resolve(itemList)
    .then(getItems)
    .then(parse);
};

const getRenderedTemplate = (data) => template({items:data})

const logger = (result) => {
  console.log(result);
  return result;
}

const logError = (error) => {
  console.error("error app:", error);
  return promise.reject(error);
}

module.exports = {
	serveHTML : () => {
    return Promise.resolve()
    .then(parseZKillboard)
    .then((result) => {console.log(result.length); return result})
    .then(decorateFromSDE)
    .then(getRenderedTemplate);
	},

  serveAPI: () => {

    return Promise.resolve()
    .then(parseZKillboard)
    .then(decorateFromSDE);
  }
};