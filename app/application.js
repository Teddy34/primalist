var _ = require('lodash');

var template = require('./UITable');
var parseZKillboard = require('./parseZKillboard');
var eveSDE = require('../io/eveSDE');

var mergeToOneObject = function(list) {
 return _.reduce(list, function(memo,value) {return _.extend(memo,value);});
};

var forceTypeNumber = function(elem) {
  elem.groupID = Number(elem.groupID);
  elem.typeID = Number(elem.typeID);
  return elem;
};

var filterEveOnly = function(elem) {
 return (elem.groupID < 100000);
};

var decorateFromSDE = function(itemList) {

  function parse(eveSDEItems) {
    return _(eveSDEItems.rows).zip(itemList).map(mergeToOneObject).map(forceTypeNumber).filter(filterEveOnly).sortBy('groupID').value();
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
	  .then(decorateFromSDE)
	  .then(getRenderedTemplate);
	}
}