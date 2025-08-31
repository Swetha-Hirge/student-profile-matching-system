const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  difficulty: { type: DataTypes.STRING },
});

module.exports = Activity;
