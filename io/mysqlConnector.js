var mysql = require('mysql');
var _ = require('lodash');

var clientConnected;

var connect = _.once(function(connectionString) {

	var connection = mysql.createConnection({
	  host: 'localhost',
	  port: 3306,
	  user: 'root',
	  password: 'root',
	  database: 'evesde'
	});

  return clientConnected = new Promise(function(resolve, reject) {
      connection.connect(function(err) {
	      if(err) {
	        console.error('Error unable to connect to database:', err)
	        reject(err);
	      }
	      else {
	        console.info('Database connected');
	        resolve(connection);
	      }
    });
  });
});

var disconnect = () => clientConnected.then(connection => connection.end());


var sendQueryWhenReady = function(query) {
  if (!clientConnected) {
    return Promise.reject('Maybe you want to connect to the database first');
  }

  function sendQuery(client){
    return new Promise(function(resolve, reject) {

		client.query(query, function (error, results, fields) {
		  if (error) return reject(error);
		  resolve(results);
		});
    });
  }
  return clientConnected.then(sendQuery);
};

module.exports = {
  connect: connect,
  disconnect: disconnect,
  sendQueryWhenReady: sendQueryWhenReady
};