// rootController.js
const db = require('../db/index');
const Lots = db.lots;
const Offers = db.offers;
const Users = db.users;
const LotsController = require('./lots'); // не забудьте імпортувати контролер лотів

const { Op } = require('sequelize');

const getRootHandler = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        let lots;

        if (searchQuery) {
            lots = await Lots.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${searchQuery}%` } },
                        { description: { [Op.iLike]: `%${searchQuery}%` } },
                    ],
                },
                order: [['start_time', 'DESC']],
            });
        } else {
            lots = await LotsController.getLots(req, res, true); // отримуємо лоти без відповіді
        }

        const searchNotFound = req.query.search === 'notfound';

        // Перевірка, чи відповіли раніше, щоб не спробувати надіслати відповіді двічі
        if (!res.headersSent) {
            res.render('index', {
                lots,
                searchQuery,
                searchNotFound,
            });
        }
    } catch (error) {
        console.error(error);
        // Перевірка, чи відповіли раніше
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = { getRootHandler };
