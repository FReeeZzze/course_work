const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

// Настройки
const { PORT, HOST, connection, dbName, dev, useErr, questionForLookLogs } = require('./config');

// middleware
const { header, errors } = require('./middleware');
const router = require('./routes');
const app = express();

app.use(logger(dev ? 'dev' : 'production'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static('uploads'));
app.use(header);
app.use('/', router);
app.use(errors);

const MainApp = async () => {
    try {
        await connection.connect((err) => {
            if (err) {
                return useErr(err, (log) => {
                    console.log('Error database connection: ', [err.message]);
                    questionForLookLogs(log);
                });
            }
            console.log(`Подключен к базе: ${dbName}`);
            app.listen(PORT, HOST, () => {
                console.log(`> Сервер стартовал: ${dev ? `http://${HOST}:${PORT}` : `https://${HOST}:${PORT}`}`);
            });
        });
        app.use((req, res) => {
            res.status(404).send('Not Found');
        });
    } catch (err) {
        return useErr(err, (log) => {
            console.log('Main err: ', [err.message]);
            questionForLookLogs(log);
        });
    }
};

MainApp().then(() => console.log('worked!'));
