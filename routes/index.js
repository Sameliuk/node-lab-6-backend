const express = require('express');
const usersRouter = require('./users');
const lotsRouter = require('./lots');
const offersRouter = require('./offers');
const rootRouter = require('./root');

const router = express.Router();

router.use('/users', usersRouter);
router.use('/lots', lotsRouter);
router.use('/offers', offersRouter);
router.use('/', rootRouter);

module.exports = router;
