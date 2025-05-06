const express = require('express');
const offersController = require('../controllers/offers');

const router = express.Router();

router.post('/create', offersController.createSingleOffer);
router.get('/lot/:lotId', offersController.getOffersByLotId);
router.get('/:offerId', offersController.getSingleOffer);

module.exports = router;
