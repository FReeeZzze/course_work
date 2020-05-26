const { connection, removeFiles, editString, csv } = require('../config');
const fs = require('fs-extra');

exports.show = (req, res) => {
    const name = req.query.name;
    if (!name) {
        res.statusCode = 500;
        return res.json({
            status: 'bad',
            result: 'empty',
        });
    }
    const sql = `SELECT * FROM ${name}`;
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
            status: 'good!',
            results,
        });
    });
};

exports.showAbonents = (req, res) => {
    // специальный абонентский запрос
    const sql = `SELECT contracts.id AS contract, contracts.Name, contracts.nameTariffPlan, contracts.toPay, 
    abonents.id as AbonentId, abonents.FirstName, abonents.LastName, abonents.MiddleName, abonents.Phone, 
    abonents.Street, abonents.House, abonents.Flat FROM abonents INNER JOIN contracts ON abonents.contract = contracts.id`;
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
            status: 'good!',
            results,
        });
    });
};

exports.addItem = (req, res) => {
    const fileData = req.file;
    const body = req.body;
    const id = req.query.id;
    const item = req.params.item;

    if (!fileData) {
        if (Object.keys(body).length === 0) {
            res.statusCode = 500;
            return res.json({
                status: 'body is empty',
            });
        }
    }

    let questionMarks = [];
    const whichSeparator = fileData.mimetype === csv ? ';' : ',';
    const keys = Object.keys(body);
    let values = Object.values(body);
    for (let i = 0; i < keys.length; i += 1) questionMarks.push('?');
    questionMarks.length = 0; // очистить массив
    if (fileData) {
        let IGNORE = 'IGNORE 1 LINES';
        const path = `${editString(__dirname, '\\', 0, 4) + '\\' + fileData.path}`;

        // проверить первую строку если есть ID то игнорировать 1 строку, если нет то просто добавлять
        const str = fs.readFileSync(path, 'utf8');
        const line = str.split('\n')[0];
        const isId = line.split(whichSeparator).filter((word) => word.toLowerCase() === 'id');
        if (isId.toString() !== 'id') IGNORE = '';

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
                    status: 'good!',
                    results: results.affectedRows >= 1,
                });
            },
        );
    } else {
        switch (item) {
            case 'contracts': {
                const tariffs = `SELECT SubscriptionFee, Name FROM tariff_plans WHERE id = ${id}`;
                connection.query(tariffs, (err, results) => {
                    if (err) {
                        console.log('Error: ', [err.message]);
                        res.statusCode = 500;
                        return res.json({
                            err: err.message,
                            status: 'error',
                        });
                    }
                    values = [...values, ...Object.values(results[0])];
                    values.push(id);
                    const sqlContract = `INSERT INTO contracts (${keys},toPay,nameTariffPlan,tariff_plan) VALUES(${questionMarks},?,?,?)`;
                    connection.query(sqlContract, values, (err, results) => {
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
                            status: 'good!',
                            results: results.affectedRows >= 1,
                        });
                    });
                });
                break;
            }
            default: {
                const sql = `INSERT INTO ${item}(${keys}) VALUES(${questionMarks})`;
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
                        status: 'good!',
                        results: results.affectedRows >= 1,
                    });
                });
            }
        }
    }
};

exports.deleteItem = (req, res) => {
    const sql = `DELETE FROM ${req.params.item} WHERE id=${req.params.id}`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.log('Error: ', [err.message]);
            res.statusCode = 500;
            return res.json({
                status: 'error',
                err: err.message,
            });
        }
        connection.query(`ALTER TABLE ${req.params.item} AUTO_INCREMENT=0`, (err) => {
            if (err) console.log('Error: ', err.message);
        });
        res.statusCode = 200;
        return res.json({
            status: 'good!',
            result: results.affectedRows >= 1,
        });
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

    switch (item) {
        case 'tariff': {
            const sqlToPay = `UPDATE contracts SET toPay = (
            SELECT SubscriptionFee FROM tariff_plans WHERE id = (
                SELECT * FROM (SELECT tariff_plan FROM contracts WHERE id = ${req.query.id}) as t1
                )
            ) WHERE id = ${req.query.id}`;
            const sqlNameTariff = `UPDATE contracts SET nameTariffPlan = (
            SELECT Name FROM tariff_plans WHERE id = (
                SELECT * FROM (SELECT tariff_plan FROM contracts WHERE id = ${req.query.id}) as t1
                )
            ) WHERE id = ${req.query.id}`;
            connection.query(sqlToPay, (err) => {
                if (err) {
                    console.log('Error: ', [err.message]);
                    res.statusCode = 500;
                    return res.json({
                        status: 'error',
                        err: err.message,
                    });
                }
            });
            connection.query(sqlNameTariff, (err) => {
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
                status: 'good!',
            });
        }
        default: {
            for (let i = 0; i < keys.length; i += 1) array.push(`${keys[i]} = '${values[i]}'`);
            const sql = `UPDATE ${req.params.item} SET ${array} WHERE id = ${req.query.id}`;
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
                res.statusCode = 200;
                return res.json({
                    status: 'good!',
                    results: results.affectedRows >= 1,
                });
            });
        }
    }
};
