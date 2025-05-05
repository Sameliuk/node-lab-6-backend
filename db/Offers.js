const Sequelize = require('sequelize');

module.exports = function (sequelize) {
    return sequelize.define(
        'offers',
        {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            lot_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            offer_price: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        { tableName: 'offers', timestamps: false }
    );
};
