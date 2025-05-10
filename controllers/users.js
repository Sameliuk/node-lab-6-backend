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

            res.status(200).json({
                user: {
                    id: newUser.id,
                    fname: newUser.fname,
                    sname: newUser.sname,
                    lots: [],
                },
            });
        } catch (error) {
            console.error('Помилка реєстрації:', error);
            res.status(500).json({
                error: 'Помилка при реєстрації. Спробуйте ще раз.',
            });
        }
    }

    async signInHandler(req, res) {
        try {
            const { fname, password } = req.body;

            const user = await Users.findOne({
                where: { fname },
                include: [
                    {
                        model: Lots,
                        as: 'lots',
                        attributes: [
                            'id',
                            'title',
                            'description',
                            'start_price',
                            'current_price',
                            'status',
                            'start_time',
                            'end_time',
                            'user_id',
                            'image',
                        ],
                    },
                ],
            });

            if (!user) {
                return res.status(401).json({
                    error: 'Невірний логін або пароль',
                });
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );
            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Невірний логін або пароль',
                });
            }

            req.session.userId = user.id;

            res.status(200).json({
                user: {
                    id: user.id,
                    fname: user.fname,
                    sname: user.sname,
                    lots: user.lots,
                },
            });
        } catch (error) {
            console.error('Помилка входу:', error);
            res.status(500).json({
                error: 'Помилка сервера',
            });
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
