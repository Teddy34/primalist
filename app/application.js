var _ = require('lodash');

var template = require('./UITable');
var parseZKillboard = require('./parseZKillboard');
var eveSDE = require('../io/swaggerConnector');

var mergeToOneObject = function(list) {
 return _.reduce(list, function(memo,value) {return _.extend(memo,value);});
};

var forceTypeNumber = function(elem) {
  elem.groupID = Number(elem.groupID);
  elem.typeID = Number(elem.typeID);
  return elem;
};

var filterEveOnlyAndMarket = function(elem) {
  //return (elem.groupID < 100000);
  return ((elem.groupID < 100000) && (elem.marketGroupID !== null));
};

var decorateFromSDE = function(itemList) {

  function parse(eveSDEItems) {
    var myItemIDs = _.pluck(itemList, 'typeID');
    var sdeItemIDs = _.pluck(eveSDEItems.rows, 'typeID');
    var difference = _.difference(myItemIDs,sdeItemIDs); // list not found items
    var myFilteredItemList = _.filter(itemList, function(item) {
      return (difference.indexOf(item.typeID) === -1);
    });

    return _(eveSDEItems.rows).zip(myFilteredItemList).map(mergeToOneObject).map(forceTypeNumber).filter(filterEveOnlyAndMarket).sortBy('groupID').value();
  }

  return eveSDE.getItems(itemList)
  .then(parse);
};

var getRenderedTemplate = function(data) {
  return template({items:data});
};

module.exports = {
	serveHTML : function() {
    return Promise.resolve()
    .then(parseZKillboard)
    .then((result) => {console.log(result.length); return result})
    .then(decorateFromSDE)
    .then(getRenderedTemplate);
	},

  serveAPI: function() {

    return Promise.resolve()
    .then(parseZKillboard)
    .then(decorateFromSDE);
  }
};

function logger(result) {
  console.log(result);
  return result;
}

function logError(error) {
  console.error("error app:", error);
  return promise.reject(error);
}