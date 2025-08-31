const app = require('./app');
const { sequelize } = require('./config/sequelize');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // adjust if you use migrations
    console.log('✅ DB connected and synced.');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
  }
})();
