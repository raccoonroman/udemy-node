const Sequelize = require('sequelize');

const sequelize = new Sequelize('udemy-node', 'root', 'KapaB9fm)', {
  dialect: 'mysql',
  host: 'localhost',
});

module.exports = sequelize;
