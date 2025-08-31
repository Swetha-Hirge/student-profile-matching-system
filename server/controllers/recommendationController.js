const Recommendation = require('../models/recommendation');
const Student = require('../models/student');
const Activity = require('../models/activity');

// Create a new recommendation
exports.createRecommendation = async (req, res) => {
  try {
    const { studentId, activityId, score } = req.body;

    if (!studentId || !activityId || typeof score !== 'number') {
      return res.status(400).json({ error: 'studentId, activityId, and score are required' });
    }

    // Optional: Validate existence of related records
    const student = await Student.findByPk(studentId);
    const activity = await Activity.findByPk(activityId);

    if (!student || !activity) {
      return res.status(404).json({ error: 'Student or Activity not found' });
    }

    const recommendation = await Recommendation.create({
      studentId,
      activityId,
      score
    });

    res.status(201).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recommendation', details: error.message });
  }
};

// Get all recommendations
exports.getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.findAll({
      include: [
        { model: Student, attributes: ['id', 'name'], as: 'Student' },
        { model: Activity, attributes: ['id', 'title'], as: 'Activity' }
      ]
    });

    res.status(200).json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations', details: error.message });
  }
};

// Get a single recommendation by ID
exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await Recommendation.findByPk(req.params.id, {
      include: [
        { model: Student, attributes: ['id', 'name'], as: 'Student' },
        { model: Activity, attributes: ['id', 'title'], as: 'Activity' }
      ]
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    res.status(200).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendation', details: error.message });
  }
};

// Update recommendation score
exports.updateRecommendation = async (req, res) => {
  try {
    const { score } = req.body;
    const recommendation = await Recommendation.findByPk(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    recommendation.score = score;
    await recommendation.save();

    res.status(200).json(recommendation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update recommendation', details: error.message });
  }
};

// Delete recommendation
exports.deleteRecommendation = async (req, res) => {
  try {
    const recommendation = await Recommendation.findByPk(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    await recommendation.destroy();
    res.status(200).json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recommendation', details: error.message });
  }
};
