// const Student = require('../models/student');
// const Activity = require('../models/activity');

// exports.matchActivities = async (studentId) => {
//   const student = await Student.findByPk(studentId);
//   const activities = await Activity.findAll();

//   // Simple rule-based matching
//   const results = activities.map((activity) => {
//     let score = 0.5;
//     if (student.learningStyle === 'visual' && activity.title.toLowerCase().includes('visual')) {
//       score += 0.4;
//     }
//     return { activity, score };
//   });

//   return results.sort((a, b) => b.score - a.score);
// };
// Match student to best activity based on disability and learningStyle
const Activity = require('../models/activity');

exports.getRecommendedActivities = async (student) => {
  const allActivities = await Activity.findAll();
  const recommendations = [];

  for (const activity of allActivities) {
    let score = 0;

    if (student.learningStyle && activity.tags?.includes(student.learningStyle.toLowerCase())) score += 0.5;
    if (student.disability && activity.tags?.includes(student.disability.toLowerCase())) score += 0.5;

    if (score > 0) {
      recommendations.push({ activityId: activity.id, score });
    }
  }

  return recommendations.sort((a, b) => b.score - a.score);
};