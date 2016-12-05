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

const filterIsOnMarket = elem => (elem.marketGroupID !== null)
const getItemIds = map(flow(property('typeID'), (nId) => String(nId)));

const decorateFromSDE = (itemList) => {
  const parse = ({rows: eveSDEItems}) => {
    const myItemIDs = getItemIds(itemList);
    const sdeItemIDs = getItemIds(eveSDEItems);

    const merge = flow(mergeToOneObject, forceTypeNumber);

    const diff = difference(myItemIDs, sdeItemIDs); // list not found items
    const myFilteredItemList = filter(item => (diff.indexOf(item.typeID) === -1), itemList);

    return flow(
      zip(myFilteredItemList),
      map(flow(mergeToOneObject, forceTypeNumber)),
      filter(filterIsOnMarket)
      )(eveSDEItems);
  }

  return Promise.resolve(itemList)
    .then(getItems)
    .then(parse);
};

const getRenderedTemplate = data => template({items:data})

module.exports = {
	serveHTML : () => {
    return Promise.resolve()
    .then(parseZKillboard)
    .then(tap(result => console.log(result.length)))
    .then(decorateFromSDE)
    .then(getRenderedTemplate)
	},

  serveAPI: () => {

    return Promise.resolve()
    .then(parseZKillboard)
    .then(decorateFromSDE);
  }
};