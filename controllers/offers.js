const db = require('../db/index');

const Lots = db.lots;
const Offers = db.offers;
const Users = db.users;

class OffersController {
    async getOffersByLotId(req, res) {
        try {
            const lotId = parseInt(req.params.lotId);

            if (isNaN(lotId)) {
                return res.status(400).json({ error: 'Недійсний ID лота' });
            }

            const offers = await Offers.findAll({
                where: { lot_id: lotId },
            });

            res.json(offers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

    async getSingleOffer(req, res) {
        try {
            const offerId = parseInt(req.params.offerId);

            if (isNaN(offerId)) {
                return res
                    .status(400)
                    .json({ error: 'Недійсний ідентифікатор пропозиції' });
            }

            const offer = await Offers.findByPk(offerId);

            if (!offer) {
                return res
                    .status(404)
                    .json({ error: 'Пропозицію не знайдено' });
            }

            res.json(offer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

    async createSingleOffer(req, res) {
        try {
            const { lotId, offerPrice } = req.body;
            const userId = req.session.userId;

            if (!userId) {
                return res
                    .status(401)
                    .json({ error: 'Користувача не авторизовано' });
            }

            const lot = await Lots.findByPk(lotId);

            if (!lot) {
                return res.status(404).json({ error: 'Лот не знайдено' });
            }

            if (offerPrice <= lot.current_price) {
                return res
                    .status(400)
                    .json({ error: 'Ставка має бути більшою за поточну ціну' });
            }

            const newOffer = await Offers.create({
                lot_id: lotId,
                user_id: userId,
                offer_price: offerPrice,
            });

            lot.current_price = offerPrice;
            await lot.save();

            const totalBids = await Offers.count({ where: { lot_id: lotId } });

            res.status(201).json({
                newMaxPrice: offerPrice,
                totalBids,
                newOffer,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }
}

module.exports = new OffersController();
