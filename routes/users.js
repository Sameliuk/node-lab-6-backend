const express = require('express');
const userController = require('../controllers/users');

const router = express.Router();

router.post('/signIn', userController.signInHandler);
router.post('/signUp', userController.signUpHandler);
router.get('/logout', userController.logOutHandler);

module.exports = router;
