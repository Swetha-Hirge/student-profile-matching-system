const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Notification = require('../models/notification');

router.get('/', verifyToken, async (req, res) => {
  const notifications = await Notification.findAll({
    where: { recipientId: req.user.id },
    order: [['createdAt', 'DESC']]
  });
  res.json(notifications);
});

router.post('/:id/read', verifyToken, async (req, res) => {
  const notification = await Notification.findByPk(req.params.id);
  if (notification && notification.recipientId === req.user.id) {
    notification.isRead = true;
    await notification.save();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Not found or not yours' });
});

module.exports = router;
