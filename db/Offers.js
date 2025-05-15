// db/Offers.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => { // Приймає sequelize, DataTypes можна взяти з нього або з require
    const Offer = sequelize.define('Offer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        lot_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'lots',
                key: 'id',
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            }
        },
        offer_price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                isDecimal: true,
                min: 0.01
            }
        }
    }, {
        tableName: 'offers',
        timestamps: false,
    });

    // Offer.associate = (models) => { ... }; // Цей блок тепер НЕ ПОТРІБЕН тут

    return Offer;
};