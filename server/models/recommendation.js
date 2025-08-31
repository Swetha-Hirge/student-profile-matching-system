const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Student = require('./student');
const Activity = require('./activity');

const Recommendation = sequelize.define('Recommendation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  score: { type: DataTypes.FLOAT },
});

// Relationships
Student.hasMany(Recommendation);
Recommendation.belongsTo(Student);

Activity.hasMany(Recommendation);
Recommendation.belongsTo(Activity);

module.exports = Recommendation;
