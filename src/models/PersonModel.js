const { DataTypes } = require('sequelize');
const { sequelize } = require('../configurations/databaseSqlite');

sequelize.sync();

const Pessoa = sequelize.define('pessoas', {
  Id: {
    type: DataTypes.INTEGER,
  },
  Nome: {
    type: DataTypes.STRING,
  },
  Email: {
    type: DataTypes.STRING,
  },
  Telefone: {
    type: DataTypes.STRING,
  },
  Instrumento: {
    type: DataTypes.STRING,
  },
  Descricao: {
    type: DataTypes.STRING,
  },
});

module.exports = Pessoa;
