const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');
const User = require('./user');
const Teacher = require('./teacher');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  disability: { type: DataTypes.STRING },
  learningStyle: { type: DataTypes.STRING }
});

// 1-to-1: User → Student
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });

// Student → Teacher relationship
Student.belongsTo(Teacher, { foreignKey: 'teacherId', as: 'teacher' });
Teacher.hasMany(Student, { foreignKey: 'teacherId', as: 'students' });

module.exports = Student;
