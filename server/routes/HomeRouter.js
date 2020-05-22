const { Router } = require('express');
const { index } = require('../controllers/homeController.js');

const homeRouter = Router(); // для адресов с "/"

//get запросы
homeRouter.get('/', index);

//post запросы

//put запросы

//delete запросы

module.exports = homeRouter;
