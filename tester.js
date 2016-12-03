const sdeConnector = require('./io/sdeConnector');
const tools = require('./tools');

const getLocationsFromSystemName = (systemName) => {
  return Promise.resolve('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'')
  .then(sdeConnector.sendQueryWhenReady)
  .then(getRows);
};

Promise.resolve()
.then(sdeConnector.connect)
.then(getLocationsFromSystemName)
.then(tools.logResult,tools.logError);

