const { appendFile, readFileSync, remove, mkdir } = require('fs-extra');
const { editString } = require('./manipulations');
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

const removeFiles = (params) => {
    const dir = editString(__dirname, '\\', 0, 4) + `\\${editString(params, '\\', 0, 4)}`;
    remove(dir, (err) => {
        if (err) return console.log('remove dir error: ', err.message);
        console.log('\n - - files and directory deleted successfully - - \n');
    });
};

const createDir = (rootDir, filename, name_of_type, callback) => {
    const DIR = `${rootDir}/${filename}/${name_of_type}`;
    mkdir(DIR, { recursive: false }, (err) => {
        if (err) {
            console.log('createDir err: ', err);
            throw err;
        }
        callback(null, DIR);
    });
};

module.exports = {
    useErr,
    questionForLookLogs,
    removeFiles,
    createDir,
    editString,
};
