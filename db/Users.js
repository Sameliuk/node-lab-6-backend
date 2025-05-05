const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    return sequelize.define(
        'users',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            fname: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            sname: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'users',
            timestamps: false, // Вимикає автоматичні поля createdAt і updatedAt
        }
    );
};
