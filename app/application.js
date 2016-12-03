const {chain, reduce, extend, map, difference, filter, zip, sortBy} = require('lodash');

const template = require('./UITable');
const parseZKillboard = require('./parseZKillboard');
const {getItems} = require('../io/eveSDE');

const mergeToOneObject = (list) => {
 return reduce(list, (memo,value) => {return extend(memo,value);});
};

const forceTypeNumber = (elem) => {
  elem.groupID = Number(elem.groupID);
  elem.typeID = Number(elem.typeID);
  return elem;
};

const filterEveOnlyAndMarket = (elem) => {
  //return (elem.groupID < 100000);
  return ((elem.groupID < 100000) && (elem.marketGroupID !== null));
};

const decorateFromSDE = (itemList) => {
  const parse = (eveSDEItems) => {
    const myItemIDs = map(itemList, 'typeID');
    const sdeItemIDs = map(eveSDEItems.rows, 'typeID').map((nId) => String(nId));
    const diff = difference(myItemIDs,sdeItemIDs); // list not found items

    const myFilteredItemList = filter(itemList, (item) => {
      return (diff.indexOf(item.typeID) === -1);
    });


    return chain(eveSDEItems.rows).zip(myFilteredItemList).map(mergeToOneObject).map(forceTypeNumber).filter(filterEveOnlyAndMarket).sortBy('groupID').value();
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