const repositoryFactory = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

class AdminUserService {
  async getRepository() {
    return await repositoryFactory.getRepository();
  }

  async getAllUsers(page = 1, limit = 10, search = null, role = null) {
    const repository = await this.getRepository();
    const skip = (page - 1) * limit;

    const result = await repository.findAllWithFilters(skip, limit, search, role);
    result.pagination.page = parseInt(page);
    result.pagination.limit = parseInt(limit);

    return result;
  }

  async getUserById(id) {
    const repository = await this.getRepository();
    const user = await repository.findByIdWithTasks(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserRole(id, role) {
    if (!role || !['USER', 'ADMIN'].includes(role)) {
      throw new Error('Invalid role. Must be USER or ADMIN');
    }

    const repository = await this.getRepository();
    const user = await repository.updateRole(id, role);
    logger.info(`User role updated: ${id} to ${role}`);
    return user;
  }

  async deleteUser(id, currentUserId) {
    if (id === currentUserId) {
      throw new Error('Cannot delete your own account');
    }

    const repository = await this.getRepository();
    await repository.delete(id);
    logger.info(`User deleted: ${id}`);
    return { message: 'User deleted successfully' };
  }

  async createUser(email, password, role = 'USER') {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!['USER', 'ADMIN'].includes(role)) {
      throw new Error('Invalid role. Must be USER or ADMIN');
    }

    const repository = await this.getRepository();
    const existingUser = await repository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await repository.create({
      email,
      password: hashedPassword,
      role
    });

    logger.info(`User created: ${email}`);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }

  async getUserTasks(id, page = 1, limit = 10, status = null) {
    const repository = await this.getRepository();
    const skip = (page - 1) * limit;

    const result = await repository.getTasksByUserId(id, skip, limit, status);
    result.pagination.page = parseInt(page);
    result.pagination.limit = parseInt(limit);

    return result;
  }

  async bulkUpdateRoles(userIds, role, currentUserId) {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      throw new Error('Invalid role. Must be USER or ADMIN');
    }

    if (userIds.includes(currentUserId)) {
      throw new Error('Cannot change your own role');
    }

    const repository = await this.getRepository();
    const result = await repository.updateManyRoles(userIds, role);

    logger.info(`Bulk role update: ${result.updatedCount} users to ${role}`);
    return result;
  }

  async bulkDeleteUsers(userIds, currentUserId) {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }

    if (userIds.includes(currentUserId)) {
      throw new Error('Cannot delete your own account');
    }

    const repository = await this.getRepository();
    const result = await repository.deleteMany(userIds);

    logger.info(`Bulk user delete: ${result.deletedCount} users`);
    return result;
  }
}

module.exports = new AdminUserService();
