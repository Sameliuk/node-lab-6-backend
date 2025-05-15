// controllers/OffersController.js
const db = require('../db/index');
const Lots = db.lots; 
const Offers = db.offers;

const { Sequelize } = require('sequelize');

class OffersController {


    async getOffersByLotId(req, res) {
        try {
            const lotId = parseInt(req.params.lotId);

            if (isNaN(lotId)) {
                return res.status(400).json({ error: 'Недійсний ID лота' });
            }

            const offers = await Offers.findAll({
                where: { lot_id: lotId },
                order: [['offer_price', 'DESC']],
                
            });

            res.json(offers);
        } catch (error) {
            console.error('[OffersController] Помилка в getOffersByLotId:', error);
            res.status(500).json({ error: 'Помилка сервера при отриманні ставок' });
        }
    }

    async getSingleOffer(req, res) {
        try {
            const offerId = parseInt(req.params.offerId);

            if (isNaN(offerId)) {
                return res.status(400).json({ error: 'Недійсний ідентифікатор пропозиції' });
            }

            const offer = await Offers.findByPk(offerId, {
     
            });

            if (!offer) {
                return res.status(404).json({ error: 'Пропозицію не знайдено' });
            }

            res.json(offer);
        } catch (error) {
            console.error('[OffersController] Помилка в getSingleOffer:', error);
            res.status(500).json({ error: 'Помилка сервера при отриманні ставки' });
        }
    }

    async createSingleOffer(req, res) {
        console.log('[OffersController] Спроба створити офер, req.body:', req.body);
        const t = await db.sequelize.transaction(); 

        try {
            const { lot_id, offer_price } = req.body; 
            const user_id_from_session = req.session.userId;

            if (!user_id_from_session) {
                await t.rollback();
                return res.status(401).json({ error: 'Необхідна авторизація для створення ставки.' });
            }

            if (lot_id === undefined || offer_price === undefined) {
                await t.rollback();
                return res.status(400).json({ error: 'Необхідно вказати ID лоту та суму ставки.' });
            }
            
            const parsedLotId = parseInt(lot_id, 10);
            const numericOfferPrice = parseFloat(offer_price);

            if (isNaN(parsedLotId)) { await t.rollback(); return res.status(400).json({ error: 'Недійсний ID лоту.' }); }
            if (isNaN(numericOfferPrice) || numericOfferPrice <= 0) { await t.rollback(); return res.status(400).json({ error: 'Сума ставки має бути позитивним числом.' }); }

            const lot = await Lots.findByPk(parsedLotId, { transaction: t });
            if (!lot) { await t.rollback(); return res.status(404).json({ error: 'Лот не знайдено.' }); }
            if (!lot.status) { await t.rollback(); return res.status(400).json({ error: 'Ставки на цей лот більше не приймаються (лот неактивний).' }); }
            if (lot.end_time && new Date(lot.end_time) < new Date()) { await t.rollback(); return res.status(400).json({ error: 'Час аукціону для цього лоту завершився.' }); }
            
            const currentEffectivePrice = parseFloat(lot.current_price) || parseFloat(lot.start_price);
            if (numericOfferPrice <= currentEffectivePrice) { await t.rollback(); return res.status(400).json({ error: `Ваша ставка (${numericOfferPrice.toFixed(2)}) має бути вищою за поточну ціну (${currentEffectivePrice.toFixed(2)}).` }); }
            
            if (lot.user_id === user_id_from_session) { await t.rollback(); return res.status(403).json({ error: 'Ви не можете робити ставки на власні лоти.' }); }

            const newOffer = await Offers.create({
                lot_id: parsedLotId,
                user_id: user_id_from_session,
                offer_price: numericOfferPrice,
            }, { transaction: t });

            lot.current_price = numericOfferPrice;
            await lot.save({ transaction: t });

            await t.commit(); 

            const totalBids = await Offers.count({ where: { lot_id: parsedLotId } }); 
            res.status(201).json({
                message: 'Ставку успішно зроблено!',
                newOffer: newOffer,
                updatedLotDetails: {
                    id: lot.id,
                    current_price: lot.current_price,
                    offerCount: totalBids 
                }
            });

        } catch (error) {
            if (t.finished !== 'commit' && t.finished !== 'rollback') { 
                 await t.rollback();
            }
            console.error('[OffersController] Помилка створення ставки:', error);
            if (!res.headersSent) {
                if (error.name === 'SequelizeValidationError') {
                     const messages = error.errors.map(e => e.message);
                     return res.status(400).json({ error: "Помилка валідації даних для ставки", details: messages });
                }
                res.status(500).json({ error: 'Помилка сервера при створенні ставки.', details: error.message });
            }
        }
    }
}

module.exports = new OffersController();