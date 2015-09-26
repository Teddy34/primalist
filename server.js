var fetch = require('node-fetch');
var _ = require('lodash');
var template = require('./UITable');

var eveSDE = require('./io/eveSDE');
eveSDE.connect(process.env.DB_CONNECTION_STRING || require('./databaseCredentials'));

var THROTTLE_DURATION = 5 * 60 * 1000;


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

function log(result) {
  console.log(result);
  return result;
}
