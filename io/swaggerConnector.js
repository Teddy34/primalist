var _ = require('lodash');
var fetch = require('node-fetch');

module.exports = {
    connect: () => Promise.resolve(),
    getItems: ()  => {
        var url = "https://evekit-sde.orbital.enterprises/20160809/api/ws/v20160809/inv/type?contid=-1&maxresults=100000&typeID=%7B%20any%3A%20true%20%7D&groupID=%7B%20any%3A%20true%20%7D&marketGroupID=%7B%20any%3A%20true%20%7D&typeName=%7B%20any%3A%20true%20%7D&volume=%7B%20any%3A%20true%20%7D";

        return fetch(url)
        .then((response) => response.json())
        //.then((raw) => {console.log('test',raw.length); return raw;})
        .then((raw) => _.pick(raw, ['typeID', 'typeName', 'groupID', 'volume', 'marketGroupID']));
    }
}