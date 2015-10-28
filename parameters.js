module.exports = {
  PORT: process.env.PORT || 8080,
  THROTTLE_DURATION: process.env.THROTTLE_DURATION || 3 * 60 * 1000,
  USER_AGENT: process.env.USER_AGENT || 'unknown',
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || require('./databaseCredentials'),
  ZKILLBOARD_PARAMS: {  url: "https://zkillboard.com/api/losses/no-attackers",
    options: {
      pastSeconds: 604800
    },
    filters: {
      /* filters are done one by one, not combined */
      corporation: (process.env.CORPORATIONS || "98161032").split(',')
    }
  }
};
// prima 98161032, wise 98078355, aideron 1894214152