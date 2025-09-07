const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth');
const ctrl = require('../controllers/feedbackController');

// Create feedback for a recommendation
router.post(
  '/recommendations/:id/feedback',
  verifyToken,
  authorizeRole(['student', 'teacher', 'admin']),
  ctrl.createForRecommendation
);

// List feedback for a recommendation
router.get(
  '/recommendations/:id/feedback',
  verifyToken,
  authorizeRole(['student', 'teacher', 'admin']),
  ctrl.listForRecommendation
);

// Student feedback history
router.get(
  '/students/:studentId/feedback',
  verifyToken,
  authorizeRole(['student', 'teacher', 'admin']),
  ctrl.listForStudent
);

// Activity aggregate summary
router.get(
  '/activities/:activityId/feedback/summary',
  verifyToken, // or open it up if you want
  authorizeRole(['teacher', 'admin']), // relax if needed
  ctrl.summaryForActivity
);

// Update / Delete
router.put(
  '/feedback/:id',
  verifyToken,
  authorizeRole(['student', 'teacher', 'admin']),
  ctrl.update
);
router.delete(
  '/feedback/:id',
  verifyToken,
  authorizeRole(['admin']),
  ctrl.remove
);

module.exports = router;
