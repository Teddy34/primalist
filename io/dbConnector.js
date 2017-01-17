const pg = require('pg');
const _ = require('lodash');
let clientConnected = null;

const connect = _.once((connectionString) => {
  return clientConnected = new Promise((resolve, reject) => {
      pg.connect(connectionString, (err, client, done) => {
      if(err) {
        console.error('Error unable to connect to database:', err);
        reject(err);
      }
      else {
        console.info('Database connected');
        resolve(client);
      }
    });
  });
});


const sendQueryWhenReady = (query) => {
  if (!clientConnected) {
    return Promise.reject('Maybe you want to connect to the database first');
  }

  const sendQuery = (client) =>{
    return new Promise((resolve, reject) => {
      client.query(query, (err, rows, cols) => {
        if(!err){
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  }
  return clientConnected.then(sendQuery);
};

module.exports = {
  connect: connect,
  sendQueryWhenReady: sendQueryWhenReady
};