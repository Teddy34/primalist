var sdeConnector = require('./io/sdeConnector');
var tools = require('./tools');

var getLocationsFromSystemName = function(systemName) {
  return sdeConnector.sendQueryWhenReady('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'')
  .then(getRows);
};


sdeConnector.connect().then(getLocationsFromSystemName).then(tools.logResult,tools.logError);

