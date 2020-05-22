const { connection } = require('../config');

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
            console.log('error: ', err);
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
    const sql = `SELECT contracts.id AS contract, contracts.Name, contracts.nameTariffPlan, contracts.toPay, 
    abonents.id as AbonentId, abonents.FirstName, abonents.LastName, abonents.MiddleName, abonents.Phone, 
    abonents.Street, abonents.House, abonents.Flat FROM abonents INNER JOIN contracts ON abonents.contract = contracts.id`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.log('error: ', err);
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
    if (Object.keys(req.body).length === 0) {
        res.statusCode = 500;
        return res.json({
            status: 'body is null',
        });
    }
    let questionMarks = [];
    const id = req.query.id;
    const item = req.params.item;
    const keys = Object.keys(req.body);
    let values = Object.values(req.body);
    // INSERT INTO contracts (`toPay`, `nameTariffPlan`) SELECT `SubscriptionFee`,`Name` FROM tariff_plans WHERE id = 1 ${req.query.id};
    for (let i = 0; i < keys.length; i += 1) questionMarks.push('?');
    if (item === 'contracts') {
        const tariffs = `SELECT SubscriptionFee, Name FROM tariff_plans WHERE id = ${id}`;
        connection.query(tariffs, (err, results) => {
            if (err) {
                console.log('error: ', err);
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
                    console.log('error: ', err);
                    res.statusCode = 500;
                    return res.json({
                        err: err.message,
                        status: 'error',
                    });
                }
                res.statusCode = 200;
                return res.json({
                    status: 'good!',
                    results,
                });
            });
        });
    } else {
        const sql = `INSERT INTO ${item}(${keys}) VALUES(${questionMarks})`;
        connection.query(sql, values, (err, results) => {
            if (err) {
                console.log('error: ', err);
                res.statusCode = 500;
                return res.json({
                    err: err.message,
                    status: 'error',
                });
            }
            res.statusCode = 200;
            return res.json({
                status: 'good!',
                results,
            });
        });
    }
};

exports.deleteItem = (req, res) => {
    const sql = `DELETE FROM ${req.params.item} WHERE id=${req.params.id}`;
    connection.query(sql, (err, results) => {
        if (err) {
            console.log('error: ', err);
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

exports.editItem = (req, res) => {
    if (Object.keys(req.body).length === 0) {
        res.statusCode = 500;
        return res.json({
            status: 'body is null',
        });
    }

    let result = null;
    let array = [];
    const item = req.params.item;
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);

    if (item === 'tariff') {
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
        connection.query(sqlToPay, (err, results) => {
            if (err) {
                console.log('error: ', err);
                res.statusCode = 500;
                return res.json({
                    status: 'error',
                    err: err.message,
                });
            }
            result = results;
        });
        connection.query(sqlNameTariff, (err, results) => {
            if (err) {
                console.log('error: ', err);
                res.statusCode = 500;
                return res.json({
                    status: 'error',
                    err: err.message,
                });
            }
            result = results;
        });

        res.statusCode = 200;
        return res.json({
            status: 'good!',
            result,
        });
    } else {
        for (let i = 0; i < keys.length; i += 1) array.push(`${keys[i]} = '${values[i]}'`);
        const sql = `UPDATE ${req.params.item} SET ${array} WHERE id = ${req.query.id}`;
        connection.query(sql, (err, results) => {
            if (err) {
                console.log('error: ', err);
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
    }
};
