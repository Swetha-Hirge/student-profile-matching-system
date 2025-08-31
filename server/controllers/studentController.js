const Student = require('../models/student');
const User = require('../models/user');
const Teacher = require('../models/teacher');
//matchingEngine
const matchingEngine = require('../services/matchingEngine');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        { model: User, as: 'user', attributes: ['username', 'email'] },
        { model: Teacher, as: 'teacher' }
      ]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['username', 'email'] },
        { model: Teacher, as: 'teacher' }
      ]
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// Update student profile (not user)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const { disability, learningStyle } = req.body;
    student.disability = disability || student.disability;
    student.learningStyle = learningStyle || student.learningStyle;
    await student.save();

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// Delete student (also delete user)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const user = await User.findByPk(student.userId);
    await student.destroy();
    if (user) await user.destroy();

    res.json({ message: 'Student and linked user deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

//matchingEngine

exports.getRecommendationsForStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const matches = await matchingEngine.getRecommendedActivities(student);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate recommendations', details: err.message });
  }
};

const Recommendation = require('../models/recommendation');
const Activity = require('../models/activity');

exports.generateAndSaveTopRecommendation = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const matches = await matchingEngine.getRecommendedActivities(student);

    if (!matches.length) {
      return res.status(200).json({ message: 'No matching activities found.' });
    }

    const topMatch = matches[0]; // highest score

    // Optional: check if already recommended
    const existing = await Recommendation.findOne({
      where: { studentId: student.id, activityId: topMatch.activityId }
    });
    if (existing) {
      return res.status(409).json({ message: 'Recommendation already exists for this activity.' });
    }

    const recommendation = await Recommendation.create({
      studentId: student.id,
      activityId: topMatch.activityId,
      score: topMatch.score
    });

    const activity = await Activity.findByPk(topMatch.activityId);

    res.status(201).json({
      message: 'Recommendation created successfully.',
      recommendation,
      matchedActivity: activity
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recommendation', details: err.message });
  }
};

