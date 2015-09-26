var pg = require('pg');
var fetch = require('node-fetch');
var connectionString = process.env.DB_CONNECTION_STRING || require('./databaseCredentials');
var _ = require('lodash');
var template = require('./UITable');

var THROTTLE_DURATION = 5 * 60 * 1000;

pg.connect(connectionString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  var evedb = require('./eveDB')(client); // pass db into evedb closure


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
  return new Promise( function(resolve,reject) {
    evedb.getItems(function(err,items){
      if(!err){
       resolve(_(items.rows).zip(itemList).map(mergeToOneObject).map(forceTypeNumber).filter(filterEveOnly).sortBy('groupID').value());
      }
      else {
       reject(err);
      }
    }, itemList);
  });
};

var getRenderedTemplate = function(data) {
  return template({items:data});
};

var zkillboard = require('./zkillboard');

var throttledWorkflow = _.throttle(function() {
  return Promise.resolve()
  .then(zkillboard)
  .then(decorateFromSDE)
  .then(getRenderedTemplate);
},THROTTLE_DURATION);

// init the webserver
app = require('express')();
app.use('/', function(req,res) {
  Promise.resolve()
  .then(throttledWorkflow)
  .then(function(response) {
    res.send(response);
  })
  .catch(function(error) {
    res.send({error:error});
  });
});

// START THE SERVER
// =============================================================================
app.listen(process.env.PORT || 8080);

// getJSON
function getJSON(response) {
  return response.json();
}

function log(toLog) {
  console.log(toLog);
}

});
