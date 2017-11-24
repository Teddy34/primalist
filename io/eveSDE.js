const dbConnector = require('./mysqlConnector');

const connect = (connectionString) => {
  return dbConnector.connect(connectionString);
};

const getItems = (itemList) => {
	  return dbConnector.sendQueryWhenReady(`SELECT typeID, typeName, groupID, volume, marketGroupID FROM invTypes WHERE typeID IN (
                  ${itemList.map((elem) => elem.typeID).toString()}) ORDER BY typeID`);
};

const getShips = () => {}

module.exports = {
  connect: connect,
  getItems: getItems
};