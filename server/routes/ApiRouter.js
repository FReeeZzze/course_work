const { Router } = require('express');
const { show, showAbonents, addItem, editItem, deleteItem } = require('../controllers/apiController.js');
const { maxCount, upload } = require('../config');

const type = upload.single('filedata'); // для загрузки одного файла
const multiType = upload.array('filedata', maxCount); // мулизагрузка

const apiRouter = Router(); // для адресов с "/api"

//get запросы
apiRouter.get('/show', show);
apiRouter.get('/show/info', showAbonents);

//post запросы
apiRouter.post('/add/:item', type, addItem);

//put запросы
apiRouter.put('/edit/:item', editItem);

//delete запросы
apiRouter.delete('/delete/:item/id/:id', deleteItem);

module.exports = apiRouter;
