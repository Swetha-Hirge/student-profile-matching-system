const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

// Admin-only actions
router.post('/', verifyToken, authorizeRole('admin'), teacherController.createTeacher);
router.put('/:id', verifyToken, authorizeRole('admin'), teacherController.updateTeacher);
router.delete('/:id', verifyToken, authorizeRole('admin'), teacherController.deleteTeacher);

// Any authenticated user can view teachers
router.get('/', verifyToken, cacheMiddleware('teachers:'), teacherController.getAllTeachers);
router.get('/:id', verifyToken, cacheMiddleware('teacher:'), teacherController.getTeacherById);

// Logged-in teacher adds student
router.post('/students', verifyToken, authorizeRole('teacher'), teacherController.createStudentUnderLoggedInTeacher);

module.exports = router;
