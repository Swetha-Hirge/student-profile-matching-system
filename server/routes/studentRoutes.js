const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache'); // keep if you have it

// Teachers only (change if you want wider access)
router.get('/', verifyToken, authorizeRole('teacher'), cacheMiddleware?.('students:') || ((req,res,next)=>next()), studentController.getAllStudents);
router.get('/:id', verifyToken, authorizeRole('teacher'), cacheMiddleware?.('student:') || ((req,res,next)=>next()), studentController.getStudentById);

router.put('/:id', verifyToken, authorizeRole('teacher'), studentController.updateStudent);
router.delete('/:id', verifyToken, authorizeRole('teacher'), studentController.deleteStudent);

router.get('/:id/recommendations', verifyToken, authorizeRole(['teacher','student']), studentController.getRecommendationsForStudent);
router.post('/:id/recommendations', verifyToken, authorizeRole('teacher'), studentController.generateAndSaveTopRecommendation);

module.exports = router;
