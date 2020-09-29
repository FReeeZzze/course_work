const { connection, removeFiles, editString, csv } = require('../config');
const fs = require('fs-extra');

exports.show = (req, res) => {
    const name = req.query.name;
    const id = req.query.id;
    if (!name) {
        res.statusCode = 500;
        return res.json({
            status: 'bad',
            result: 'empty',
        });
    }
    if (name === 'all') {
        const sql = `SHOW TABLES`;
        connection.query(sql, (err, results) => {
            if (err) {
                console.log('Error: ', [err.message]);
                res.statusCode = 500;
                return res.json({
                    status: 'error',
                    err: err.message,
                });
            }
            let allTables = [];
            for (let i = 0; i < results.length; i += 1) {
                allTables = [...allTables, ...Object.values(results[i])];
            }
            res.statusCode = 200;
            return res.json({
                status: 'ok',
                results: allTables,
            });
        });
    } else {
        const sql = `SELECT * FROM ${name} ${id ? `WHERE id=${id}` : ''}`;
        connection.query(sql, (err, results) => {
            if (err) {
                console.log('Error: ', [err.message]);
                res.statusCode = 500;
                return res.json({
                    status: 'error',
                    err: err.message,
                });
            }
            res.statusCode = 200;
            return res.json({
                status: 'ok',
                results,
            });
        });
    }
};

exports.showAbonents = (req, res) => {
    // специальный абонентский запрос
    const sql = `SELECT contracts.id AS contract, contracts.Name, contracts.nameTariffPlan, contracts.toPay, 
    abonents.id as AbonentId, abonents.FirstName, abonents.LastName, abonents.MiddleName, abonents.Phone, 
    abonents.Street, abonents.House, abonents.Flat FROM contracts INNER JOIN abonents ON contracts.abonent = abonents.id`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.log('Error: ', [err.message]);
            res.statusCode = 500;
            return res.json({
                status: 'error',
                err: err.message,
            });
        }
        res.statusCode = 200;
        return res.json({
            status: 'ok',
            results,
        });
    });
};

exports.addItem = (req, res) => {
    const fileData = req.file;
    const body = req.body;
    const item = req.params.item;

    if (!fileData) {
        if (Object.keys(body).length === 0) {
            res.statusCode = 500;
            return res.json({
                status: 'body is empty',
            });
        }
    }

    if (fileData) {
        const whichSeparator = fileData.mimetype === csv ? ';' : ',';
        let IGNORE = 'IGNORE 1 LINES';
        const path = `${editString(__dirname, '\\', 0, 4) + '\\' + fileData.path}`;

        // проверить первую строку если есть ID то игнорировать 1 строку, если нет то просто добавлять
        const str = fs.readFileSync(path, 'utf8');
        const line = str.split('\n')[0];
        const isId = line.split(whichSeparator).filter((word) => word.toLowerCase() === 'id');
        if (isId.toString() !== 'id') IGNORE = '';

        // CRLF or LF, так как LF - (\n) используется в LINUX дистрибудтивах лучше всего именно так сделать нежели CRLF - (\r\n)
        const upload = `LOAD DATA LOCAL INFILE '${path}' INTO TABLE ${item} CHARACTER SET UTF8 FIELDS TERMINATED BY '${whichSeparator}' 
        LINES TERMINATED BY '\\r\\n' ${IGNORE}`;

        connection.query(
            {
                sql: upload,
                values: [],
                infileStreamFactory: () => fs.createReadStream(path),
            },
            (err, results) => {
                // добавить данные из файла в базу и удалить файл за собой, как делают все цивилизованные люди!
                if (!fileData.length) removeFiles(fileData.path);
                else {
                    for (let i = 0; i < fileData.length; i++) {
                        const path = fileData[i].path;
                        removeFiles(path);
                    }
                }

                if (err) {
                    console.log('Error: ', [err.message]);
                    res.statusCode = 500;
                    return res.json({
                        status: 'error',
                        err: err.message,
                    });
                }
                res.statusCode = 200;
                return res.json({
                    status: 'ok',
                    results: results.affectedRows >= 1,
                });
            },
        );
    } else {
        let questionMarks = [];
        const keys = Object.keys(body);
        let values = Object.values(body);
        for (let i = 0; i < keys.length; i += 1) questionMarks.push('?');
        let array = [];
        for (let i = 0; i < keys.length; i += 1) array.push(`${keys[i]} = '${values[i]}'`);

        const sql = `INSERT INTO ${item}(${keys}) VALUES(${questionMarks}) ON DUPLICATE KEY UPDATE ${array}`;
        array.length = 0; // очистить массив
        questionMarks.length = 0; // очистить массив
        connection.query(sql, values, (err, results) => {
            if (err) {
                console.log('Error: ', [err.message]);
                res.statusCode = 500;
                return res.json({
                    err: err.message,
                    status: 'error',
                });
            }
            res.statusCode = 200;
            return res.json({
                status: 'ok',
                results: results.affectedRows >= 1,
                id: results.insertId,
            });
        });
    }
};

exports.deleteItem = (req, res) => {
    const sql = `DELETE FROM ${req.params.item} WHERE id=${req.params.id}`;
    const alter = `ALTER TABLE ${req.params.item} AUTO_INCREMENT=0`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.log('Error: ', [err.message]);
            res.statusCode = 500;
            return res.json({
                status: 'error',
                err: err.message,
            });
        }
        const callback = () => {
            res.statusCode = 200;
            return res.json({
                status: 'ok',
                result: results.affectedRows >= 1,
            });
        };
        connection.query(alter, (err) => {
            if (err) console.log('Error: ', err.message);
            callback();
        });
    });
    connection.query(alter, (err) => {
        if (err) console.log('Error: ', err.message);
    });
};

exports.editItem = (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.statusCode = 500;
        return res.json({
            status: 'body is empty',
        });
    }

    let array = [];
    const item = req.params.item;
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const id = req.query.id;

    const callUpdate = (results) => {
        const upReq = `SELECT * FROM (SELECT tariff_plan FROM contracts WHERE id = ${id})`;
        const sql = `UPDATE contracts SET toPay = (SELECT SubscriptionFee FROM tariff_plans WHERE id = (${upReq} as t1)), 
                     nameTariffPlan = (SELECT Name FROM tariff_plans WHERE id = (${upReq} as t2)),
                     min = (SELECT CostPerMinuteRub FROM tariff_plans WHERE id = (${upReq} as t3)) WHERE id = ${id}`;
        connection.query(sql, (err) => {
            if (err) {
                console.log('Error: ', [err.message]);
                res.statusCode = 500;
                return res.json({
                    status: 'error',
                    err: err.message,
                });
            }
        });
        res.statusCode = 200;
        return res.json({
            status: 'ok',
            results: results.affectedRows >= 1,
        });
    };

    for (let i = 0; i < keys.length; i += 1) {
        array.push(`${keys[i]} = '${values[i]}'`);
    }

    const sql = `UPDATE ${item} SET ${array} WHERE id = ${id}`;
    array.length = 0; // очистить массив
    connection.query(sql, (err, results) => {
        if (err) {
            console.log('Error: ', [err.message]);
            res.statusCode = 500;
            return res.json({
                status: 'error',
                err: err.message,
            });
        }
        if (item === 'contracts') callUpdate(results);
        else {
            res.statusCode = 200;
            return res.json({
                status: 'ok',
                results: results.affectedRows >= 1,
            });
        }
    });
};
