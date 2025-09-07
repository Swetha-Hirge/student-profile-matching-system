const { Op, fn, col, literal } = require('sequelize');
const Feedback = require('../models/feedback');
const Recommendation = require('../models/recommendation');
const Student = require('../models/student');
const Teacher = require('../models/teacher');
const Activity = require('../models/activity');

/**
 * Helper: teacher owns this student?
 */
async function teacherOwnsStudent(userId, studentId) {
  const teacher = await Teacher.findOne({ where: { userId } });
  if (!teacher) return false;
  const s = await Student.findByPk(studentId);
  return s && s.teacherId === teacher.id;
}

/**
 * POST /api/recommendations/:id/feedback
 * Student (owner) leaves feedback for a recommendation they received.
 */
exports.createForRecommendation = async (req, res) => {
  try {
    const recId = Number(req.params.id);
    if (!Number.isInteger(recId)) return res.status(400).json({ error: 'Invalid recommendation id' });

    const rec = await Recommendation.findByPk(recId);
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

    // permissions
    if (req.user.role === 'student') {
      const me = await Student.findOne({ where: { userId: req.user.id } });
      if (!me) return res.status(404).json({ error: 'Student profile not found' });
      if (me.id !== rec.studentId) return res.status(403).json({ error: 'Forbidden: not your recommendation' });
    } else if (req.user.role === 'teacher') {
      const ok = await teacherOwnsStudent(req.user.id, rec.studentId);
      if (!ok) return res.status(403).json({ error: 'Forbidden: not your student' });
    } // admin allowed

    const { rating, helpful = null, comment = '' } = req.body;
    if (!(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
      return res.status(400).json({ error: 'rating must be an integer 1..5' });
    }

    const fb = await Feedback.create({
      recommendationId: rec.id,
      studentId: rec.studentId,
      activityId: rec.activityId,
      rating,
      helpful: typeof helpful === 'boolean' ? helpful : null,
      comment: String(comment || '').trim(),
      createdBy: req.user.role
    });

    res.status(201).json({ message: 'Feedback saved', data: fb });
  } catch (err) {
    console.error('[feedback.create]', err);
    res.status(500).json({ error: 'Failed to create feedback', details: err.message });
  }
};

/**
 * GET /api/recommendations/:id/feedback
 * View all feedback for a recommendation (student owner, teacher owner, or admin).
 */
exports.listForRecommendation = async (req, res) => {
  try {
    const recId = Number(req.params.id);
    if (!Number.isInteger(recId)) return res.status(400).json({ error: 'Invalid recommendation id' });

    const rec = await Recommendation.findByPk(recId);
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

    if (req.user.role === 'student') {
      const me = await Student.findOne({ where: { userId: req.user.id } });
      if (!me) return res.status(404).json({ error: 'Student profile not found' });
      if (me.id !== rec.studentId) return res.status(403).json({ error: 'Forbidden' });
    } else if (req.user.role === 'teacher') {
      const ok = await teacherOwnsStudent(req.user.id, rec.studentId);
      if (!ok) return res.status(403).json({ error: 'Forbidden' });
    }

    const list = await Feedback.findAll({
      where: { recommendationId: rec.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ data: list });
  } catch (err) {
    console.error('[feedback.listForRecommendation]', err);
    res.status(500).json({ error: 'Failed to load feedback', details: err.message });
  }
};

/**
 * GET /api/students/:studentId/feedback
 * Teacher (owner) or admin can see a student's feedback history. Student can see own.
 */
exports.listForStudent = async (req, res) => {
  try {
    const sid = Number(req.params.studentId);
    if (!Number.isInteger(sid)) return res.status(400).json({ error: 'Invalid student id' });

    if (req.user.role === 'student') {
      const me = await Student.findOne({ where: { userId: req.user.id } });
      if (!me || me.id !== sid) return res.status(403).json({ error: 'Forbidden' });
    } else if (req.user.role === 'teacher') {
      const ok = await teacherOwnsStudent(req.user.id, sid);
      if (!ok) return res.status(403).json({ error: 'Forbidden' });
    }

    const list = await Feedback.findAll({
      where: { studentId: sid },
      include: [{ model: Activity, attributes: ['id', 'title', 'difficulty', 'type'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ data: list });
  } catch (err) {
    console.error('[feedback.listForStudent]', err);
    res.status(500).json({ error: 'Failed to load feedback', details: err.message });
  }
};

/**
 * GET /api/activities/:activityId/feedback/summary
 * Public-ish aggregate (but protect to teacher/admin if you prefer)
 */
exports.summaryForActivity = async (req, res) => {
  try {
    const aid = Number(req.params.activityId);
    if (!Number.isInteger(aid)) return res.status(400).json({ error: 'Invalid activity id' });

    const rows = await Feedback.findAll({
      where: { activityId: aid },
      attributes: [
        [fn('COUNT', col('id')), 'count'],
        [fn('AVG', col('rating')), 'avgRating'],
        [fn('SUM', literal(`CASE WHEN "helpful" = true THEN 1 ELSE 0 END`)), 'helpfulCount']
      ]
    });

    const { count, avgRating, helpfulCount } = rows?.[0]?.dataValues || {};
    res.json({
      activityId: aid,
      count: Number(count || 0),
      avgRating: avgRating ? Number(avgRating).toFixed(2) : null,
      helpfulCount: Number(helpfulCount || 0)
    });
  } catch (err) {
    console.error('[feedback.summaryForActivity]', err);
    res.status(500).json({ error: 'Failed to build summary', details: err.message });
  }
};

/**
 * PUT /api/feedback/:id
 * Student can edit their own feedback; teacher/admin can edit all (optional).
 */
exports.update = async (req, res) => {
  try {
    const fid = Number(req.params.id);
    if (!Number.isInteger(fid)) return res.status(400).json({ error: 'Invalid feedback id' });

    const fb = await Feedback.findByPk(fid);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });

    if (req.user.role === 'student') {
      const me = await Student.findOne({ where: { userId: req.user.id } });
      if (!me || me.id !== fb.studentId) return res.status(403).json({ error: 'Forbidden' });
    } else if (req.user.role === 'teacher') {
      const ok = await teacherOwnsStudent(req.user.id, fb.studentId);
      if (!ok) return res.status(403).json({ error: 'Forbidden' });
    }

    const { rating, helpful, comment } = req.body;
    if (rating !== undefined) {
      if (!(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
        return res.status(400).json({ error: 'rating must be 1..5' });
      }
      fb.rating = rating;
    }
    if (helpful !== undefined) fb.helpful = !!helpful;
    if (comment !== undefined) fb.comment = String(comment).trim();

    await fb.save();
    res.json({ message: 'Updated', data: fb });
  } catch (err) {
    console.error('[feedback.update]', err);
    res.status(500).json({ error: 'Failed to update feedback', details: err.message });
  }
};

/**
 * DELETE /api/feedback/:id  (admin only by default)
 */
exports.remove = async (req, res) => {
  try {
    const fid = Number(req.params.id);
    if (!Number.isInteger(fid)) return res.status(400).json({ error: 'Invalid feedback id' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const fb = await Feedback.findByPk(fid);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });

    await fb.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('[feedback.delete]', err);
    res.status(500).json({ error: 'Failed to delete feedback', details: err.message });
  }
};
