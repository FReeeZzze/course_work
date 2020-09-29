const express = require('express');
const ApiRouter = require('./ApiRouter');
const HomeRouter = require('./HomeRouter');
const router = express.Router();

router.use('/', HomeRouter);
router.use('/api', ApiRouter);

module.exports = router;
