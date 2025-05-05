const express = require('express');
const offersController = require('../controllers/offers');

const router = express.Router();

router.post('/', offersController.createSingleOffer);
router.post('/create', offersController.createSingleOffer);
router.get('/create', offersController.showCreateOfferForm);
router.get('/lot/:lotId', offersController.getOffersByLotId);
router.get('/:offerId', offersController.getSingleOffer);

module.exports = router;
