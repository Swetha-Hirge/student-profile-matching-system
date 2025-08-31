const User = require('../models/user');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

// Admin creates teacher
exports.createTeacher = async (req, res) => {
  try {
    const { username, email, password, subject } = req.body;

    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] }
    });
    if (existing) return res.status(409).json({ error: 'Username or email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: 'teacher' });
    const teacher = await Teacher.create({ userId: user.id, subject });

    res.status(201).json({ user, teacher });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create teacher', details: err.message });
  }
};

// All teachers with students + user info
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [
        { model: Student, as: 'students' },
        { model: User, as: 'user', attributes: ['username', 'email'] }
      ]
    });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

// Get one teacher
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        { model: Student, as: 'students' },
        { model: User, as: 'user', attributes: ['username', 'email'] }
      ]
    });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
};

// Update subject
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    teacher.subject = req.body.subject || teacher.subject;
    await teacher.save();

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
};

// Delete teacher + user
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const user = await User.findByPk(teacher.userId);
    await teacher.destroy();
    if (user) await user.destroy();

    res.json({ message: 'Teacher and user deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
};

// Logged-in teacher creates a student
exports.createStudentUnderLoggedInTeacher = async (req, res) => {
  try {
    const { username, email, password, disability, learningStyle } = req.body;
console.log("jshdhsdfihudhfusduofuisfdiu")
    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    // Create new user for student
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed, role: 'student' });

    // Find the teacher profile of the currently logged-in user
    const teacher = await Teacher.findOne({ where: { userId: req.user.id } });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    // Create the student profile
    const student = await Student.create({
      userId: user.id,
      teacherId: teacher.id,
      disability,
      learningStyle
    });

    // ✅ Create a notification for the teacher
    const Notification = require('../models/notification');
    await Notification.create({
      message: `👶 New student "${username}" added`,
      recipientId: req.user.id // the logged-in teacher's user ID
    });

    res.status(201).json({ user, student });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create student under teacher', details: err.message });
  }
};
