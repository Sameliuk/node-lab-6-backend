// routes/lots.js
const express = require('express');
const router = express.Router();
// Імпортуємо контролер з файлу 'lots.js'
const lotsController = require('../controllers/lots.js'); // <--- ОСЬ ТУТ ЗМІНА

// --- Маршрути для лотів ---

// GET /lots -> Отримати всі лоти (з пагінацією та можливістю фільтрації/пошуку через query params)
router.get('/', lotsController.getLots);

// POST /lots/create -> Створити новий лот
// (Якщо ви вирішите змінити на POST /lots, оновіть і тут, і на фронтенді)
router.post('/create', lotsController.createSingleLot);

// GET /lots/search -> Пошук лотів за назвою (title як query parameter)
// Переконайтеся, що метод searchLotByTitle в controllers/lots.js тепер читає req.query.title
router.get('/search', lotsController.searchLotByTitle);

// GET /lots/user/:userId -> Отримати лоти конкретного користувача
// Цей маршрут більш специфічний, тому ставимо його перед /:lotId
router.get('/user/:userId', lotsController.getLotsByUserId);

// GET /lots/:lotId -> Отримати один лот за ID
router.get('/:lotId', lotsController.getSingleLot);

// PUT /lots/:lotId -> Оновити інформацію про лот
router.put('/:lotId', lotsController.updateSingleLot);

// PUT /lots/:lotId/status -> Оновити тільки статус лоту
router.put('/:lotId/status', lotsController.updateLotStatus);

// DELETE /lots/:lotId -> Видалити лот
router.delete('/:lotId', lotsController.deleteSingleLot);

module.exports = router;