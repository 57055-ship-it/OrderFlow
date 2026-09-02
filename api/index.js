const connectDB = require('../server/config/db');
const app = require('../server/app');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless DB Error]:', error.message);
  }
  return app(req, res);
};
