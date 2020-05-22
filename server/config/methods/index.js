const { appendFile, readFileSync } = require('fs-extra');
const { createInterface } = require('readline');

// -------------------------------------------- //
const IOstream = createInterface({
    input: process.stdin,
    output: process.stdout,
});

IOstream.on('close', () => {
    process.exit(0);
});

let dateTime = new Date()
    .toLocaleString()
    .replace(',', '')
    .replace(/:.. /, ' ');
// -------------------------------------------- //

// Methods
const questionForLookLogs = (log) => {
    IOstream.question('Пожалуйста введите Y/N для просмотра логов / закрытия: ', (input) => {
        if (input.toUpperCase() === 'Y') console.log('Все логи: ', log);
        IOstream.close();
    });
};

const useErr = (err, callback) => {
    appendFile('server/errors/logs.txt', `[${dateTime}] - ${err} \r\n`, (err) => {
        if (err) console.log('fs-error: ', [err.message]);
        const log = readFileSync('server/errors/logs.txt', 'utf8', (err) => {
            if (err) console.log('fs-error: ', [err.message]);
        });
        callback(log);
    });
};

module.exports = {
    useErr,
    questionForLookLogs,
};
