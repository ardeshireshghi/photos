const dotenv = require('dotenv');

dotenv.config();

const { startServer } = require('./dist/infrastructure/webserver/server');
startServer();
