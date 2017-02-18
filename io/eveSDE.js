const dbConnector = require('./dbConnector');

const connect = (connectionString) => {
  return dbConnector.connect(connectionString);
};

const getItems = (itemList) => {
  return dbConnector.sendQueryWhenReady(`SELECT t."typeID", t."typeName", t."groupID", t."volume", t."marketGroupID" FROM "invTypes" AS "t" WHERE "typeID" IN (
                  ${itemList.map((elem) => elem.typeID).toString()}) ORDER BY "typeID"`);
};

module.exports = {
  connect: connect,
  getItems: getItems
};