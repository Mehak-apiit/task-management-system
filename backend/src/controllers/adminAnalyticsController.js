const adminAnalyticsService = require('../services/adminAnalyticsService');
const { sendSuccess } = require('../middleware/responseFormatter');

class AdminAnalyticsController {
  async getDashboardStats(req, res, next) {
    try {
      const data = await adminAnalyticsService.getDashboardStats();
      sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await adminAnalyticsService.getUserStats(startDate, endDate);
      sendSuccess(res, 200, 'User statistics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getTaskStats(req, res, next) {
    try {
      const { startDate, endDate, userId } = req.query;
      const data = await adminAnalyticsService.getTaskStats(startDate, endDate, userId);
      sendSuccess(res, 200, 'Task statistics retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminAnalyticsController();
