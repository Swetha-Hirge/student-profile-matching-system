const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const { cacheMiddleware } = require('../middleware/cache');

router.get('/', verifyToken, cacheMiddleware('activities:'), activityController.getAllActivities);
router.post('/', verifyToken, authorizeRole(['admin', 'teacher']), activityController.createActivity);

module.exports = router;