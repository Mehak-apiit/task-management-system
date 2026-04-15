const taskService = require('../services/taskService');
const { sendCreated, sendSuccess, sendPaginated } = require('../middleware/responseFormatter');
const logger = require('../config/logger');

class TaskController {
  async createTask(req, res, next) {
    try {
      logger.info(`Creating task for user: ${req.user.userId}, full user object: ${JSON.stringify(req.user)}`);
      const task = await taskService.createTask(req.body, req.user.userId);

      sendCreated(res, 'Task created successfully', task);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req, res, next) {
    try {
      const task = await taskService.getTaskById(
        req.params.id,
        req.user.userId,
        req.user.role
      );

      sendSuccess(res, 200, 'Task retrieved successfully', task);
    } catch (error) {
      next(error);
    }
  }

  async getUserTasks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || null;

      const result = await taskService.getUserTasks(
        req.user.userId,
        page,
        limit,
        status
      );

      sendPaginated(res, 'Tasks retrieved successfully', result.tasks, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getAllTasks(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || null;

      const result = await taskService.getAllTasks(page, limit, status);

      sendPaginated(res, 'All tasks retrieved successfully', result.tasks, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req, res, next) {
    try {
      const task = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user.userId,
        req.user.role
      );

      sendSuccess(res, 200, 'Task updated successfully', task);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req, res, next) {
    try {
      const result = await taskService.deleteTask(
        req.params.id,
        req.user.userId,
        req.user.role
      );

      sendSuccess(res, 200, 'Task deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
