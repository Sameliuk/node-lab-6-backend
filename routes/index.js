const express = require('express');
const usersRouter = require('./users');
const lotsRouter = require('./lots');
const offersRouter = require('./offers');
const rootRouter = require('./root');

console.log('--- У файлі routes/index.js ---');
console.log('typeof usersRouter:', typeof usersRouter);     
console.log('typeof lotsRouter:', typeof lotsRouter);       
console.log('typeof offersRouter:', typeof offersRouter);   
console.log('typeof rootRouter:', typeof rootRouter);       
console.log('--------------------------------');

const router = express.Router();

router.use('/users', usersRouter);
router.use('/lots', lotsRouter);
router.use('/offers', offersRouter);
router.use('/', rootRouter);

module.exports = router;
