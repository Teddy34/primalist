module.exports = function(db){
var ret = {};

var _ = require('lodash');

var req = 'SELECT t."typeName", m."quantity" FROM "invTypeMaterials" AS "m" INNER JOIN "invTypes" AS "t" ON m."materialTypeID" = t."typeID" WHERE m."typeID" = 10039;';
var req2 = 'SELECT t."typeID", t."typeName", t."groupID" FROM "invTypes" AS "t" WHERE "typeID" IN '+ '(185,209,6159,1236)' +'ORDER BY "typeID"';

var doQuery = function(callback, query) {
  db.query(query, function(err, rows, cols){
    if(!err){
      callback(null, rows);
    } else {
      callback(err);
    }
  });
};

ret.getItems = function(callback, itemList) {
  var request = 'SELECT t."typeName", t."groupID" FROM "invTypes" AS "t" WHERE "typeID" IN (' +
    _.map(itemList, function(elem) {return elem.typeID;}).toString() +
    ') ORDER BY "typeID"';
  doQuery(callback, request);
};

ret.getCivShieldBooster = function(callback, query) {
  doQuery(callback, req);
};

return ret;
};