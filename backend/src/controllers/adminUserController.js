const adminUserService = require('../services/adminUserService');
const { sendSuccess, sendCreated, sendPaginated } = require('../middleware/responseFormatter');

class AdminUserController {
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, search, role } = req.query;
      const result = await adminUserService.getAllUsers(page, limit, search, role);
      sendPaginated(res, 'Users retrieved successfully', result.users, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await adminUserService.getUserById(id);
      sendSuccess(res, 200, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await adminUserService.updateUserRole(id, role);
      sendSuccess(res, 200, 'User role updated successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminUserService.deleteUser(id, req.user.userId);
      sendSuccess(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { email, password, role = 'USER' } = req.body;
      const user = await adminUserService.createUser(email, password, role);
      sendCreated(res, 'User created successfully', user);
    } catch (error) {
      next(error);
    }
  }

  async getUserTasks(req, res, next) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const result = await adminUserService.getUserTasks(id, page, limit, status);
      sendPaginated(res, 'User tasks retrieved successfully', result.tasks, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateRoles(req, res, next) {
    try {
      const { userIds, role } = req.body;
      const result = await adminUserService.bulkUpdateRoles(userIds, role, req.user.userId);
      sendSuccess(res, 200, `${result.updatedCount} users updated successfully`, result);
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteUsers(req, res, next) {
    try {
      const { userIds } = req.body;
      const result = await adminUserService.bulkDeleteUsers(userIds, req.user.userId);
      sendSuccess(res, 200, `${result.deletedCount} users deleted successfully`, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUserController();
