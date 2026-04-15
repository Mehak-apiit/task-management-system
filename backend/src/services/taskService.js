const repositoryFactory = require('../config/database');
const logger = require('../config/logger');

class TaskService {
  async getRepository() {
    return await repositoryFactory.getRepository();
  }

  async createTask(taskData, userId) {
    const repository = await this.getRepository();
    const task = await repository.createTask({
      ...taskData,
      userId
    });

    logger.info(`Task created: ${task.id} by user ${userId}`);
    return task;
  }

  async getTaskById(taskId, userId, userRole) {
    const repository = await this.getRepository();
    const task = await repository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Users can only access their own tasks, admins can access all
    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new Error('Access denied');
    }

    return task;
  }

  async getUserTasks(userId, page = 1, limit = 10, status = null) {
    const repository = await this.getRepository();
    const skip = (page - 1) * limit;
    const { tasks, total } = await repository.findTasksByUserId(userId, skip, limit, status);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAllTasks(page = 1, limit = 10, status = null) {
    const repository = await this.getRepository();
    const skip = (page - 1) * limit;
    const { tasks, total } = await repository.findAllTasks(skip, limit, status);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateTask(taskId, updateData, userId, userRole) {
    const repository = await this.getRepository();
    const task = await repository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Users can only update their own tasks, admins can update all
    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new Error('Access denied');
    }

    const updatedTask = await repository.updateTask(taskId, updateData);
    logger.info(`Task updated: ${taskId} by user ${userId}`);
    return updatedTask;
  }

  async deleteTask(taskId, userId, userRole) {
    const repository = await this.getRepository();
    const task = await repository.findTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Users can only delete their own tasks, admins can delete all
    if (userRole !== 'ADMIN' && task.userId !== userId) {
      throw new Error('Access denied');
    }

    await repository.deleteTask(taskId);
    logger.info(`Task deleted: ${taskId} by user ${userId}`);
    return { message: 'Task deleted successfully' };
  }
}

module.exports = new TaskService();
