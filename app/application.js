const {
  flow,
  map,
  difference,
  filter,
  zip,
  toNumber,
  property,
  tap
} = require('lodash/fp');

const log = (text) => tap(() => console.log(text));

const template = require('./UITable');
const parseZKillboard = require('./parseZKillboard');
const {getItems} = require('../io/eveSDE');

const mergeToOneObject = (arr) => Object.assign({}, ...arr);

const forceTypeNumber = (elem) => Object.assign(
  {},
  elem,
  {
    groupID: toNumber(elem.groupID),
    typeID: toNumber(elem.typeID)
  }
);

const mergeAndFormat = flow(mergeToOneObject, forceTypeNumber);

const filterIsOnMarket = elem => (elem.marketGroupID !== null)
const getItemIds = map(flow(property('typeID'), (nId) => String(nId)));

const decorateFromSDE = (itemList) => {
  const parse = (eveSDEItems) => {
    const myItemIDs = getItemIds(itemList);
    const sdeItemIDs = getItemIds(eveSDEItems);

    const diff = difference(myItemIDs, sdeItemIDs); // list not found items
    const myFilteredItemList = filter(item => (diff.indexOf(item.typeID) === -1), itemList);

    return flow(
      zip(myFilteredItemList),
      map(mergeAndFormat),
      filter(filterIsOnMarket)
      )(eveSDEItems);
  }

  return Promise.resolve(itemList)
  .then(log('getting items'))
    .then(getItems)
    .then(log('item got'))
    .then(property('rows'))
    .then(parse)
    .then(log('parsed'));
};

const getRenderedTemplate = data => template({items:data})

module.exports = {
	serveHTML : () => Promise.resolve()
    .then(parseZKillboard)
    .then(tap(result => console.log(result.length)))
    .then(decorateFromSDE)
    .then(getRenderedTemplate)
  ,

  serveAPI: () => Promise.resolve()
    .then(parseZKillboard)
    .then(decorateFromSDE)
};