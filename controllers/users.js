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
            res.redirect('/users/profile');
        } catch (error) {
            console.error(error);
            res.render('auth/signUp', {
                error: 'Помилка при реєстрації. Спробуйте ще раз.',
            });
        }
    }

    async signInHandler(req, res) {
        try {
            const { fname, password } = req.body;

            const user = await Users.findOne({ where: { fname } });

            if (!user) {
                return res.render('auth/signIn', {
                    error: 'Невірний логін або пароль',
                });
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password
            );
            if (!isPasswordValid) {
                return res.render('auth/signIn', {
                    error: 'Невірний логін або пароль',
                });
            }

            req.session.userId = user.id;
            res.redirect('/users/profile');
        } catch (error) {
            console.error(error);
            res.render('auth/signIn', {
                error: 'Помилка сервера',
            });
        }
    }

    async getUserProfile(req, res) {
        try {
            if (!req.session || !req.session.userId) {
                return res.redirect('/users/signIn');
            }

            const userId = req.session.userId;
            const user = await Users.findByPk(userId, {
                attributes: ['id', 'fname', 'sname'],
                include: [
                    {
                        model: Lots,
                        as: 'lots',
                        order: [['start_time', 'DESC']],
                    },
                ],
            });

            if (!user) {
                req.session.destroy();
                return res.redirect('/users/signIn');
            }
            res.render('userProfile', {
                user,
                lots: user.lots || [],
                error: null,
            });
        } catch (error) {
            console.error(error);
            res.render('userProfile', {
                error: 'Помилка сервера',
                user: null,
                lots: [],
            });
        }
    }

    async getSingleUserHandler(req, res) {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }

            const user = await Users.findByPk(userId, {
                attributes: ['id', 'fname', 'sname'],
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    logOutHandler(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Помилка сервера');
            }

            res.clearCookie('connect.sid');
            res.setHeader('Cache-Control', 'no-store');

            res.redirect('/users/signIn');
        });
    }
}

module.exports = new UserController();
