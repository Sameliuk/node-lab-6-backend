// db/Offers.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => { 
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
        },
        offer_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        }
    }, {
        tableName: 'offers',
        timestamps: false,
    });


    return Offer;
};