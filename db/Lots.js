const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    return sequelize.define(
        'lots',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            start_price: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'start_price',
            },
            current_price: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'current_price',
            },
            status: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            start_time: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'start_time',
            },
            end_time: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'end_time',
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                field: 'user_id',
            },
            image: {
                type: Sequelize.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'lots',
            timestamps: false, // <--- ДУЖЕ ВАЖЛИВО!
        }
    );
};
