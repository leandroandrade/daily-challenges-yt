const {HandleCsv} = require('./handle-csv');

const handler = new HandleCsv({
    filename: 'big-file.csv',
    url: 'http://localhost:4000',
    httpPipelining: 10,
    httpConnections: 20
});

handler.run();
