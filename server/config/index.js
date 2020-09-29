const { createConnection } = require('mysql2');
const { useErr, questionForLookLogs, removeFiles, editString } = require('./Methods');
const { csv, txt } = require('./Types');
const upload = require('./UploadFiles');
const dev = process.env.NODE_ENV !== 'production';

//Общие настройки
const HOST = 'localhost';
const PORT = parseInt(process.env.PORT || 5000, 10);
const client = dev ? `http://${HOST}:3000` : `https://tel.redw.me`;

const configConnection = {
    host: 'localhost',
    user: 'root',
    database: 'cityTN',
    password: 'JOJOkaka2020',
    dateStrings: true,
    multipleStatements: true,
    supportBigNumbers: true,
    bigNumberStrings: false,
    flags: ['+LOCAL_FILES'],
};

const connection = createConnection(configConnection);

module.exports = {
    useErr,
    questionForLookLogs,
    removeFiles,
    editString,
    csv,
    txt,
    dev,
    HOST,
    PORT,
    client,
    upload,
    connection,
    maxCount: '2',
    dbName: configConnection.database,
};
