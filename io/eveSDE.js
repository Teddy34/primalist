var dbConnector = require('./dbConnector');
var _ = require('lodash');

var connect = function(connectionString) {
  return dbConnector.connect(connectionString);
};

var getItems = function(itemList) {
  return dbConnector.sendQueryWhenReady('SELECT t."typeID", t."typeName", t."groupID", t."volume" FROM "invTypes" AS "t" WHERE "typeID" IN (' +
                  _.map(itemList, function(elem) {return elem.typeID;}).toString() +
                  ') ORDER BY "typeID"');
};

module.exports = {
  connect: connect,
  getItems: getItems
};