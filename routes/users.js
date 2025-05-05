const express = require('express');
const userController = require('../controllers/users');

const router = express.Router();

router.get('/profile', userController.getUserProfile);
router.get('/signUp', (req, res) => {
    res.render('auth/signUp', { error: null });
});

router.get('/signIn', (req, res) => {
    res.render('auth/signIn');
});

router.post('/signIn', userController.signInHandler);
router.post('/signUp', userController.signUpHandler);
router.get('/logout', userController.logOutHandler);
router.get('/:userId', userController.getSingleUserHandler);

module.exports = router;
