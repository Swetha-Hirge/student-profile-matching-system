const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const Recommendation = require('./recommendation');
const Student = require('./student');
const Activity = require('./activity');

const Feedback = sequelize.define('Feedback', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // who/what this feedback is for
  recommendationId: { type: DataTypes.INTEGER, allowNull: false },
  studentId:        { type: DataTypes.INTEGER, allowNull: false },
  activityId:       { type: DataTypes.INTEGER, allowNull: false },

  // feedback content
  rating:  { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  helpful: { type: DataTypes.BOOLEAN, defaultValue: null }, // optional thumbs-up
  comment: { type: DataTypes.TEXT },

  createdBy: {                                     // who submitted
    type: DataTypes.ENUM('student', 'teacher', 'admin'),
    allowNull: false,
    defaultValue: 'student'
  }
}, {
  tableName: 'Feedback',
  timestamps: true
});

// Associations
Feedback.belongsTo(Recommendation, { foreignKey: 'recommendationId' });
Feedback.belongsTo(Student,        { foreignKey: 'studentId' });
Feedback.belongsTo(Activity,       { foreignKey: 'activityId' });

module.exports = Feedback;
