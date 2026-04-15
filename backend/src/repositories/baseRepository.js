/**
 * Base Repository Interface
 * All database-specific repositories should implement these methods
 */
class BaseRepository {
  constructor(dbManager) {
    this.dbManager = dbManager;
  }

  // User methods
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async create(data) {
    throw new Error('Method not implemented');
  }

  async findAll(skip = 0, take = 10) {
    throw new Error('Method not implemented');
  }

  async findAllWithFilters(skip = 0, take = 10, search = null, role = null) {
    throw new Error('Method not implemented');
  }

  async updateRole(id, role) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async deleteMany(ids) {
    throw new Error('Method not implemented');
  }

  async updateManyRoles(ids, role) {
    throw new Error('Method not implemented');
  }

  async findByIdWithTasks(id) {
    throw new Error('Method not implemented');
  }

  // Task methods
  async findTaskById(id) {
    throw new Error('Method not implemented');
  }

  async findTasksByUserId(userId, skip = 0, take = 10, status = null) {
    throw new Error('Method not implemented');
  }

  async createTask(data) {
    throw new Error('Method not implemented');
  }

  async updateTask(id, data) {
    throw new Error('Method not implemented');
  }

  async deleteTask(id) {
    throw new Error('Method not implemented');
  }

  async findAllTasks(skip = 0, take = 10, status = null) {
    throw new Error('Method not implemented');
  }

  // Analytics methods
  async getUserCount() {
    throw new Error('Method not implemented');
  }

  async getTaskCount() {
    throw new Error('Method not implemented');
  }

  async getActiveUserCount() {
    throw new Error('Method not implemented');
  }

  async getTaskCountByStatus(status) {
    throw new Error('Method not implemented');
  }

  async getUsersByRole() {
    throw new Error('Method not implemented');
  }

  async getTasksByStatus() {
    throw new Error('Method not implemented');
  }

  async getTasksByPriority() {
    throw new Error('Method not implemented');
  }

  async getRecentUsers(limit = 5) {
    throw new Error('Method not implemented');
  }

  async getRecentTasks(limit = 5) {
    throw new Error('Method not implemented');
  }

  async getUserGrowth(startDate, endDate) {
    throw new Error('Method not implemented');
  }

  async getUsersWithTasksCount() {
    throw new Error('Method not implemented');
  }

  async getNewUsersCount(startDate, endDate) {
    throw new Error('Method not implemented');
  }

  async getTasksByUserId(userId, skip = 0, take = 10, status = null) {
    throw new Error('Method not implemented');
  }

  async getAverageTasksPerUser() {
    throw new Error('Method not implemented');
  }

  async getTaskCompletionRate() {
    throw new Error('Method not implemented');
  }
}

module.exports = BaseRepository;
