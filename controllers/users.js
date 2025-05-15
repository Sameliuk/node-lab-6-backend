const db = require('../db/index');
const Lots = db.lots;
const Users = db.users;
const bcrypt = require('bcrypt');

class UserController {
async signUpHandler(req, res) {
        try {
            const { fname, sname, password } = req.body;
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = await Users.create({
                fname,
                sname,
                password: hashedPassword,
            });

            req.session.userId = newUser.id; 

            req.session.save((err) => {
                if (err) {
                    console.error('[SignUpHandler] Помилка збереження сесії:', err);
                    return res.status(500).json({
                        error: 'Помилка при збереженні сесії після реєстрації.',
                    });
                }
                console.log('[SignUpHandler] Сесію успішно збережено, userId:', req.session.userId);

                res.status(200).json({
                    user: {
                        id: newUser.id,
                        fname: newUser.fname,
                        sname: newUser.sname,
                        lots: [], 
                    },
                });
            });

        } catch (error) {
            console.error('Помилка реєстрації:', error);
            if (!res.headersSent) { 
                 res.status(500).json({
                    error: 'Помилка при реєстрації. Спробуйте ще раз.',
                });
            }
        }
    }

    async signInHandler(req, res) {
        try {
            const { fname, password: plainPasswordFromRequest } = req.body;

            console.log('-----------------------------------------');
            console.log('[SignInAttempt] Отримано запит на вхід.');
            console.log(`[SignInAttempt] fname з запиту: '${fname}'`);

            const user = await Users.findOne({ where: { fname } });

            if (!user) {
                console.log(`[SignInAttempt] Користувача з fname '${fname}' НЕ ЗНАЙДЕНО.`);
                console.log('-----------------------------------------');
                return res.status(401).json({ error: 'Невірний логін або пароль' });
            }

            console.log(`[SignInAttempt] Знайдено користувача: ID ${user.id}, хеш пароля: '${user.password}'`);
            const isPasswordValid = await bcrypt.compare(plainPasswordFromRequest, user.password);
            console.log(`[SignInAttempt] Результат bcrypt.compare: ${isPasswordValid}`);

            if (!isPasswordValid) {
                console.log('[SignInAttempt] Пароль невірний.');
                console.log('-----------------------------------------');
                return res.status(401).json({ error: 'Невірний логін або пароль' });
            }

            req.session.userId = user.id; 

            req.session.save((err) => {
                if (err) {
                    console.error('[SignInHandler] Помилка збереження сесії:', err);
                    return res.status(500).json({
                        error: 'Помилка при збереженні сесії після входу.',
                    });
                }
                console.log('[SignInHandler] Сесію успішно збережено, userId:', req.session.userId);

                Users.findOne({ 
                    where: { id: user.id },
                    include: [{ model: Lots, as: 'lots'  }]
                }).then(userWithLots => {
                    if (!userWithLots) { 
                        console.error('[SignInHandler] Не вдалося знайти користувача з лотами після збереження сесії.');
                        return res.status(500).json({ error: 'Помилка отримання даних користувача'});
                    }
                    res.status(200).json({
                        user: {
                            id: userWithLots.id,
                            fname: userWithLots.fname,
                            sname: userWithLots.sname,
                            lots: userWithLots.lots || [],
                        },
                    });
                }).catch(findErr => {
                    console.error('[SignInHandler] Помилка при запиті userWithLots:', findErr);
                    res.status(500).json({ error: 'Помилка сервера при отриманні даних користувача з лотами.' });
                });
            });

        } catch (error) {
            console.error('[SignInAttempt] КРИТИЧНА ПОМИЛКА в signInHandler:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Помилка сервера під час входу' });
            }
        }
    }

    async logOutHandler(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Помилка при завершенні сесії:', err);
                return res.status(500).json({ error: 'Помилка сервера' });
            }

            res.clearCookie('connect.sid');
            res.setHeader('Cache-Control', 'no-store');

            res.status(200).json({
                message: 'Користувач успішно вийшов із системи',
            });
        });
    }
}

module.exports = new UserController();