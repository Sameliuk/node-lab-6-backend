const db = require('../db/index');
const Lots = db.lots;
const Offers = db.offers;
const Users = db.users;
const { Op } = require('sequelize');

class LotsController {
    // Метод для отримання всіх лотів
    async getLots(req, res, returnData = false) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const offset = (page - 1) * limit;

            const { count, rows: lots } = await Lots.findAndCountAll({
                offset,
                limit,
                order: [['id', 'DESC']],
            });

            const totalPages = Math.ceil(count / limit);

            if (returnData) return lots;

            if (!res.headersSent) {
                res.json({
                    lots,
                    pagination: {
                        page,
                        totalPages,
                        totalItems: count,
                    },
                });
            }
        } catch (error) {
            console.error(error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Помилка сервера' });
            }
        }
    }

    // Метод для отримання лотів за ID користувача
    async getLotsByUserId(req, res) {
        try {
            const userId = parseInt(req.params.userId);

            const lots = await Lots.findAll({ where: { user_id: userId } });

            res.json(lots);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

    // Метод для оновлення статусу лоту
    async updateLotStatus(req, res) {
        try {
            const lotId = parseInt(req.params.lotId);
            const { newStatus } = req.body;

            if (!req.session?.userId) {
                return res.status(401).json({ error: 'Необхідна авторизація' });
            }

            if (newStatus === undefined || newStatus === null) {
                return res
                    .status(400)
                    .json({ error: 'Не надано нового статусу' });
            }

            const validStatus = Boolean(newStatus);
            if (
                newStatus !== 'true' &&
                newStatus !== 'false' &&
                typeof newStatus !== 'boolean'
            ) {
                return res
                    .status(400)
                    .json({ error: 'Невірне значення статусу' });
            }

            const lot = await Lots.findByPk(lotId);
            if (!lot) {
                return res.status(404).json({ error: 'Лот не знайдено' });
            }

            if (lot.user_id !== req.session.userId) {
                return res.status(403).json({ error: 'Недостатньо прав' });
            }

            lot.status = validStatus;
            await lot.save();

            res.json({ success: true });
        } catch (error) {
            console.error('Error updating lot status:', error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

    async getSingleLot(req, res) {
        try {
            const lotId = parseInt(req.params.lotId);

            if (isNaN(lotId)) {
                return res
                    .status(400)
                    .json({ error: 'Недійсний ідентифікатор лоту' });
            }

            const lot = await Lots.findByPk(lotId);

            if (!lot) {
                return res.status(404).json({ error: 'Лот не знайдено' });
            }

            const acceptHeader = req.headers.accept;

            if (acceptHeader && acceptHeader.includes('application/json')) {
                return res.json(lot);
            }

            const offerCount = await Offers.count({ where: { lot_id: lotId } });

            res.render('lot', {
                lot,
                offerCount,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Помилка сервера');
        }
    }

    async createSingleLot(req, res) {
        try {
            const {
                userId,
                title,
                description,
                startPrice,
                status,
                startTime,
                endTime,
                image,
            } = req.body;

            let userIdToUse = userId || req.session?.userId;

            if (!title || !description || !startPrice || !userIdToUse) {
                return res
                    .status(400)
                    .json({ error: "Не всі обов'язкові поля заповнені" });
            }

            const newLot = await Lots.create({
                user_id: userIdToUse,
                title,
                description,
                start_price: startPrice,
                current_price: startPrice,
                status: status !== undefined ? Boolean(status) : true,
                start_time: startTime,
                end_time: endTime,
                image,
            });

            res.status(201).json(newLot);
        } catch (error) {
            console.error('Error creating lot:', error);
            res.status(400).json({
                error: 'Помилка створення лоту',
                details: error.message,
            });
        }
    }

    async updateLotStatus(req, res) {
        try {
            const lotId = parseInt(req.params.lotId);
            const { newStatus } = req.body;

            if (!req.session || !req.session.userId) {
                return res.status(401).json({ error: 'Необхідна авторизація' });
            }

            const userId = req.session.userId;

            // Fetch the lot by lotId and check its user_id
            const lot = await Lots.findOne({
                where: { id: lotId },
            });

            if (!lot) {
                return res.status(404).json({ error: 'Лот не знайдено' });
            }

            if (lot.user_id !== userId) {
                return res.status(403).json({ error: 'Недостатньо прав' });
            }

            // Update the lot status
            await lot.update({ status: newStatus });

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

    // Метод для оновлення конкретного лоту
    async updateSingleLot(req, res) {
        try {
            const lotId = parseInt(req.params.lotId);
            const {
                title,
                description,
                startPrice,
                status,
                startTime,
                endTime,
                image,
            } = req.body;

            if (!req.session?.userId) {
                return res.status(401).json({ error: 'Необхідна авторизація' });
            }

            const lot = await Lots.findByPk(lotId);

            if (!lot) {
                return res.status(404).json({ error: 'Лот не знайдено' });
            }

            if (lot.user_id !== req.session.userId) {
                return res.status(403).json({ error: 'Недостатньо прав' });
            }

            await lot.update({
                title,
                description,
                start_price: startPrice,
                status: Boolean(status),
                start_time: startTime,
                end_time: endTime,
                image,
            });

            res.json(lot);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

    // Метод для видалення конкретного лоту
    async deleteSingleLot(req, res) {
        try {
            const lotId = parseInt(req.params.lotId);

            if (!req.session?.userId) {
                return res.status(401).json({ error: 'Необхідна авторизація' });
            }

            const lot = await Lots.findByPk(lotId);

            if (!lot) {
                return res.status(404).json({ error: 'Лот не знайдено' });
            }

            if (lot.user_id !== req.session.userId) {
                return res.status(403).json({ error: 'Недостатньо прав' });
            }

            await Offers.destroy({ where: { lot_id: lotId } });
            await lot.destroy();

            res.status(200).json({
                message: 'Лот та всі офери видалено успішно',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Внутрішня помилка сервера' });
        }
    }

    // Метод для пошуку лоту за назвою
    async searchLotByTitle(req, res) {
        try {
            const { title } = req.body;

            if (!title) {
                return res
                    .status(400)
                    .json({ error: 'Title parameter is required' });
            }

            const foundLots = await Lots.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${title}%` } },
                        { description: { [Op.iLike]: `%${title}%` } },
                    ],
                },
            });

            if (foundLots.length === 0) {
                return res.status(404).json({
                    error: 'No lots found with this title or description',
                });
            }

            res.json(foundLots);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new LotsController();
