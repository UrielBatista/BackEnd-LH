const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'C:\\Users\\Uriel\\Documents\\Musica LH Project\\backend\\database\\pessoas.db',
});

module.exports = { sequelize };