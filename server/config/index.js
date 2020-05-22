const { createConnection } = require('mysql2');
const { useErr, questionForLookLogs } = require('./methods');
const dev = process.env.NODE_ENV !== 'production';

//Общие настройки
const HOST = 'localhost';
const PORT = parseInt(process.env.PORT || 5000, 10);
const client = dev ? `http://${HOST}:3000` : `https://tel.redw.me`;

const configConnection = {
    host: 'localhost',
    user: 'root',
    database: 'course_work',
    password: 'JOJOkaka2020',
};

const connection = createConnection(configConnection);

module.exports = {
    useErr,
    questionForLookLogs,
    dev,
    HOST,
    PORT,
    client,
    connection,
    dbName: configConnection.database,
};
