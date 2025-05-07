const db = require('../db/index');
const Lots = db.lots;
const Offers = db.offers;
const Users = db.users;
const { Op, Sequelize } = require('sequelize');

class LotsController {
    async getLots(req, res, returnData = false) {
        try {
            const { startTime, endTime } = req.query;

            const whereConditions = {};

            if (startTime !== undefined) {
                whereConditions.start_time = { [Op.gte]: new Date(startTime) };
            }

            if (endTime !== undefined) {
                whereConditions.end_time = { [Op.lte]: new Date(endTime) };
            }

            const lots = await Lots.findAll({ where: whereConditions });

            if (returnData) {
                return res.status(200).json(lots);
            }

            if (!res.headersSent) {
                res.status(200).json(lots);
            }
        } catch (error) {
            console.error(error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Помилка сервера' });
            }
        }
    }

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

            const offerCount = await Offers.count({ where: { lot_id: lotId } });

            res.status(200).json({
                lot,
                offerCount,
            });
        } catch (error) {
            console.error('Error fetching lot:', error);
            res.status(500).json({ error: 'Помилка сервера' });
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
            res.status(500).json({
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

            const lot = await Lots.findOne({
                where: { id: lotId },
            });

            if (!lot) {
                return res.status(404).json({ error: 'Лот не знайдено' });
            }

            if (lot.user_id !== userId) {
                return res.status(403).json({ error: 'Недостатньо прав' });
            }

            await lot.update({ status: newStatus });

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

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

            res.status(200).json(lot);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Помилка сервера' });
        }
    }

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
            console.error('Error deleting lot:', error);
            res.status(500).json({ error: 'Внутрішня помилка сервера' });
        }
    }

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
