const repositoryFactory = require('../config/database');
const logger = require('../config/logger');

class AdminAnalyticsService {
  async getRepository() {
    return await repositoryFactory.getRepository();
  }

  async getDashboardStats() {
    const repository = await this.getRepository();

    const [
      totalUsers,
      totalTasks,
      activeUsers,
      completedTasks,
      pendingTasks,
      usersByRole,
      tasksByStatus,
      tasksByPriority,
      recentUsers,
      recentTasks
    ] = await Promise.all([
      repository.getUserCount(),
      repository.getTaskCount(),
      repository.getActiveUserCount(),
      repository.getTaskCountByStatus('completed'),
      repository.getTaskCountByStatus('pending'),
      repository.getUsersByRole(),
      repository.getTasksByStatus(),
      repository.getTasksByPriority(),
      repository.getRecentUsers(5),
      repository.getRecentTasks(5)
    ]);

    return {
      overview: {
        totalUsers,
        totalTasks,
        activeUsers,
        completedTasks,
        pendingTasks
      },
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role
      })),
      tasksByStatus: tasksByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      tasksByPriority: tasksByPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority
      })),
      recentUsers,
      recentTasks
    };
  }

  async getUserStats(startDate, endDate) {
    const repository = await this.getRepository();

    const [
      totalUsers,
      newUsers,
      usersWithTasks,
      userGrowth
    ] = await Promise.all([
      repository.getUserCount(),
      repository.getNewUsersCount(startDate, endDate),
      repository.getUsersWithTasksCount(),
      repository.getUserGrowth(startDate, endDate)
    ]);

    const userGrowthByMonth = {};
    userGrowth.forEach(user => {
      const month = user.createdAt.toISOString().slice(0, 7);
      userGrowthByMonth[month] = (userGrowthByMonth[month] || 0) + 1;
    });

    return {
      totalUsers,
      newUsers,
      usersWithTasks,
      userGrowthByMonth
    };
  }

  async getTaskStats(startDate, endDate, userId) {
    const repository = await this.getRepository();

    const [
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      avgTasksPerUser,
      taskCompletionRate
    ] = await Promise.all([
      repository.getTaskCount(),
      repository.getTasksByStatus(),
      repository.getTasksByPriority(),
      repository.getAverageTasksPerUser(),
      repository.getTaskCompletionRate()
    ]);

    return {
      totalTasks,
      tasksByStatus: tasksByStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      tasksByPriority: tasksByPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority
      })),
      avgTasksPerUser: parseFloat(avgTasksPerUser),
      taskCompletionRate: parseFloat(taskCompletionRate)
    };
  }
}

module.exports = new AdminAnalyticsService();
