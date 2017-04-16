const sdeConnector = require('./io/dbConnector');

const getLocationsFromSystemName = (systemName) => {
  return Promise.resolve('SELECT s."solarSystemID", s."solarSystemName", t."stationID", s."constellationID", s."regionID" FROM "staStations" AS "t" INNER JOIN "mapSolarSystems" s ON s."solarSystemID"=t."solarSystemID" WHERE "solarSystemName" = \''+systemName+'\'')
  .then(sdeConnector.sendQueryWhenReady)
  .then(getRows);
};

Promise.resolve()
.then(sdeConnector.connect)
.then(() => getLocationsFromSystemName('Fliet'))
.then((value) => console.log('success', value),(err) => console.log('error', err));

