// controllers/OffersController.js
const db = require('../db/index');
const Lots = db.lots; 
const Offers = db.offers;
const Users = db.users;

const { Sequelize } = require('sequelize');

// Add debugging information about the Offers model
console.log('[OffersController] Offers model information:',
  'tableName:', Offers.tableName,
  'attributes:', Object.keys(Offers.rawAttributes).join(', ')
);

// Log a warning about the model vs database schema mismatch
console.log('[OffersController] NOTICE: The database schema for "offers" table does not include an "offer_time" column.');
console.log('[OffersController] Make sure your model definition matches the actual database structure.');

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
        let t; // Define transaction outside try block so it's accessible in catch
        
        try {
            // Verify database connection first
            try {
                await db.sequelize.authenticate();
                console.log('[OffersController] Підключення до бази даних успішне');
            } catch (dbError) {
                console.error('[OffersController] Помилка підключення до бази даних:', dbError);
                return res.status(500).json({ 
                    error: 'Проблема з підключенням до бази даних',
                    details: dbError.message
                });
            }
            
            // Start transaction
            t = await db.sequelize.transaction();
            console.log('[OffersController] Транзакція ініціалізована');

            const { lot_id, offer_price } = req.body; 
            const user_id_from_session = req.session?.userId;

            console.log('[OffersController] Дані запиту:', { lot_id, offer_price, user_id_from_session });

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

            if (isNaN(parsedLotId)) { 
                await t.rollback(); 
                return res.status(400).json({ error: 'Недійсний ID лоту.' }); 
            }
            
            if (isNaN(numericOfferPrice) || numericOfferPrice <= 0) { 
                await t.rollback(); 
                return res.status(400).json({ error: 'Сума ставки має бути позитивним числом.' }); 
            }

            console.log('[OffersController] Пошук лоту з ID:', parsedLotId);
            const lot = await Lots.findByPk(parsedLotId, { transaction: t });
            
            if (!lot) { 
                await t.rollback(); 
                return res.status(404).json({ error: 'Лот не знайдено.' }); 
            }
            
            if (!lot.status) { 
                await t.rollback(); 
                return res.status(400).json({ error: 'Ставки на цей лот більше не приймаються (лот неактивний).' }); 
            }
            
            if (lot.end_time && new Date(lot.end_time) < new Date()) { 
                await t.rollback(); 
                return res.status(400).json({ error: 'Час аукціону для цього лоту завершився.' }); 
            }
            
            const currentEffectivePrice = parseFloat(lot.current_price) || parseFloat(lot.start_price);
            console.log('[OffersController] Перевірка ціни:', { 
                offerPrice: numericOfferPrice, 
                currentPrice: currentEffectivePrice 
            });
            
            if (numericOfferPrice <= currentEffectivePrice) { 
                await t.rollback(); 
                return res.status(400).json({ 
                    error: `Ваша ставка (${numericOfferPrice.toFixed(2)}) має бути вищою за поточну ціну (${currentEffectivePrice.toFixed(2)}).` 
                }); 
            }
            
            if (lot.user_id === user_id_from_session) { 
                await t.rollback(); 
                return res.status(403).json({ error: 'Ви не можете робити ставки на власні лоти.' }); 
            }

            console.log('[OffersController] Створення нового оферу');
            const newOffer = await Offers.create({
                lot_id: parsedLotId,
                user_id: user_id_from_session,
                offer_price: numericOfferPrice
            }, { transaction: t });

            console.log('[OffersController] Оновлення поточної ціни лоту');
            lot.current_price = numericOfferPrice;
            await lot.save({ transaction: t });

            console.log('[OffersController] Підтвердження транзакції');
            await t.commit();
            console.log('[OffersController] Транзакція успішно підтверджена');

            // Get count of offers after transaction is committed
            const totalBids = await Offers.count({ where: { lot_id: parsedLotId } });
            console.log('[OffersController] Загальна кількість ставок:', totalBids);
            
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
            console.error('[OffersController] Детальна помилка:', error.stack || error);
            // Log more specific error details that might be hidden in the error object
            if (error.name) console.error('[OffersController] Error name:', error.name);
            if (error.message) console.error('[OffersController] Error message:', error.message);
            if (error.parent) console.error('[OffersController] Database error details:', error.parent);
            if (error.original) console.error('[OffersController] Original error:', error.original);
            if (error.sql) console.error('[OffersController] Failed SQL:', error.sql);
            
            try {
                // Ensure transaction is rolled back if not already
                if (t && !t.finished) {
                    console.log('[OffersController] Відкат транзакції через помилку');
                    await t.rollback();
                }
            } catch (rollbackError) {
                console.error('[OffersController] Помилка при відкаті транзакції:', rollbackError);
            }
            
            if (!res.headersSent) {
                if (error.name === 'SequelizeValidationError') {
                    const messages = error.errors.map(e => e.message);
                    return res.status(400).json({ error: "Помилка валідації даних для ставки", details: messages });
                }
                return res.status(500).json({ 
                    error: 'Помилка сервера при створенні ставки.', 
                    details: error.message || 'Невідома помилка бази даних'
                });
            }
        }
    }
}

module.exports = new OffersController();