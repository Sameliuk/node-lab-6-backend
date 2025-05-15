// routes/offers.js
const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offers.js'); 


router.post('/', offersController.createSingleOffer); 


router.get('/lot/:lotId', offersController.getOffersByLotId);


console.log('--- Перевірка offersController перед router.get("/:offerId") ---');
console.log('offersController існує:', !!offersController);
if (offersController) {
  console.log('typeof offersController.getSingleOffer:', typeof offersController.getSingleOffer);
}
console.log('--------------------------------------------------------------');


router.get('/:offerId', offersController.getSingleOffer);

module.exports = router;