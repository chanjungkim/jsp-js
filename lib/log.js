const winston = require('winston');

module.exports = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({json: false, timestamp: true})
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({json: false, timestamp: true})
    ],
    exitOnError: true
});
