const Sequelize = require('sequelize');

const sequelize = new Sequelize('Node_4', 'postgres', '75227522', {
    dialect: 'postgres',
    host: 'localhost',
});

const Lots = require('./Lots.js')(sequelize);
const Offers = require('./Offers.js')(sequelize);
const Users = require('./Users.js')(sequelize);

Users.hasMany(Lots, {
    foreignKey: 'user_id',
    as: 'lots',
});

Lots.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'user',
});

Lots.hasMany(Offers, {
    foreignKey: 'lot_id',
    as: 'offers',
});

Offers.belongsTo(Lots, {
    foreignKey: 'lot_id',
    as: 'lot',
});

Users.hasMany(Offers, {
    foreignKey: 'user_id',
    as: 'offers',
});
Offers.belongsTo(Users, {
    foreignKey: 'user_id',
    as: 'user',
});

module.exports = {
    sequelize,
    lots: Lots,
    offers: Offers,
    users: Users,
};
