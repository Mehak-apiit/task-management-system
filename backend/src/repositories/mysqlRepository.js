const crypto = require('crypto');
const BaseRepository = require('./baseRepository');
const logger = require('../config/logger');

class MySQLRepository extends BaseRepository {
  constructor(connection) {
    super(connection);
    this.connection = connection;
  }

  // Helper method to execute queries
  async executeQuery(query, params = []) {
    try {
      const [results] = await this.connection.execute(query, params);
      return results;
    } catch (error) {
      logger.error('MySQL query error:', error);
      throw error;
    }
  }

  // User methods
  async findByEmail(email) {
    const [rows] = await this.connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const [rows] = await this.connection.execute(
      'SELECT id, email, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  async create(data) {
    const userId = data.id || crypto.randomUUID();
    
    const query = `
      INSERT INTO users (id, email, password, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    await this.connection.execute(query, [
      userId,
      data.email,
      data.password,
      data.role !== undefined ? data.role : 'USER'
    ]);
    return this.findById(userId);
  }

  async findAll(skip = 0, take = 10) {
    const [users] = await this.connection.execute(
      'SELECT id, email, role, created_at as createdAt, updated_at as updatedAt FROM users LIMIT ? OFFSET ?',
      [take, skip]
    );
    const [count] = await this.connection.execute('SELECT COUNT(*) as total FROM users');
    return { users, total: count[0].total };
  }

  async updateRole(id, role) {
    await this.connection.execute(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
      [role, id]
    );
    return this.findById(id);
  }

  async delete(id) {
    await this.connection.execute('DELETE FROM users WHERE id = ?', [id]);
    return { message: 'User deleted' };
  }

  // Task methods
  async findTaskById(id) {
    const [rows] = await this.connection.execute(
      `SELECT t.*, u.id as userId, u.email as userEmail, u.role as userRole 
       FROM tasks t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    
    const task = rows[0];
    return {
      ...task,
      user: task.userId ? {
        id: task.userId,
        email: task.userEmail,
        role: task.userRole
      } : null
    };
  }

  async findTasksByUserId(userId, skip = 0, take = 10, status = null) {
    let query = `
      SELECT t.*, u.id as userId, u.email as userEmail, u.role as userRole 
      FROM tasks t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(take, skip);

    const [tasks] = await this.connection.execute(query, params);
    
    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ? AND status = ?'
      : 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
    const countParams = status ? [userId, status] : [userId];
    const [count] = await this.connection.execute(countQuery, countParams);

    return { tasks, total: count[0].total };
  }

  async createTask(data) {
    const taskId = data.id || crypto.randomUUID();
    
    const query = `
      INSERT INTO tasks (id, title, description, status, priority, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    await this.connection.execute(query, [
      taskId,
      data.title,
      data.description !== undefined ? data.description : null,
      data.status || 'pending',
      data.priority || 'medium',
      data.userId
    ]);
    return this.findTaskById(taskId);
  }

  async updateTask(id, data) {
    const fields = [];
    const params = [];

    if (data.title) {
      fields.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      params.push(data.description);
    }
    if (data.status) {
      fields.push('status = ?');
      params.push(data.status);
    }
    if (data.priority) {
      fields.push('priority = ?');
      params.push(data.priority);
    }

    if (fields.length === 0) {
      return this.findTaskById(id);
    }

    fields.push('updated_at = NOW()');
    params.push(id);

    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    await this.connection.execute(query, params);
    return this.findTaskById(id);
  }

  async deleteTask(id) {
    await this.connection.execute('DELETE FROM tasks WHERE id = ?', [id]);
    return { message: 'Task deleted' };
  }

  async findAllTasks(skip = 0, take = 10, status = null) {
    let query = `
      SELECT t.*, u.id as userId, u.email as userEmail, u.role as userRole 
      FROM tasks t 
      LEFT JOIN users u ON t.user_id = u.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(take, skip);

    const [tasks] = await this.connection.execute(query, params);
    
    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM tasks WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM tasks';
    const countParams = status ? [status] : [];
    const [count] = await this.connection.execute(countQuery, countParams);

    return { tasks, total: count[0].total };
  }

  // Admin-specific methods
  async findAllWithFilters(skip = 0, take = 10, search = null, role = null) {
    let query = `
      SELECT u.id, u.email, u.role, u.created_at as createdAt, u.updated_at as updatedAt,
             (SELECT COUNT(*) FROM tasks WHERE user_id = u.id) as taskCount
      FROM users u
    `;
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('u.email LIKE ?');
      params.push(`%${search}%`);
    }
    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(take), skip);

    const [users] = await this.connection.execute(query, params);
    
    const countQuery = `
      SELECT COUNT(*) as total FROM users u
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
    `;
    const [count] = await this.connection.execute(countQuery, params.slice(0, -2));

    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      _count: { tasks: user.taskCount }
    }));

    return {
      users: formattedUsers,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: parseInt(take),
        total: count[0].total,
        totalPages: Math.ceil(count[0].total / take)
      }
    };
  }

  async deleteMany(ids) {
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await this.connection.execute(
      `DELETE FROM users WHERE id IN (${placeholders})`,
      ids
    );
    return { deletedCount: result.affectedRows };
  }

  async updateManyRoles(ids, role) {
    const placeholders = ids.map(() => '?').join(',');
    const params = [role, ...ids];
    const [result] = await this.connection.execute(
      `UPDATE users SET role = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
      params
    );
    return { updatedCount: result.affectedRows };
  }

  async findByIdWithTasks(id) {
    const [users] = await this.connection.execute(
      'SELECT id, email, role, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
      [id]
    );
    if (!users[0]) return null;

    const user = users[0];
    const [tasks] = await this.connection.execute(
      'SELECT id, title, status, priority, created_at as createdAt FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [id]
    );

    return {
      ...user,
      tasks
    };
  }

  // Analytics methods
  async getUserCount() {
    const [count] = await this.connection.execute('SELECT COUNT(*) as total FROM users');
    return count[0].total;
  }

  async getTaskCount() {
    const [count] = await this.connection.execute('SELECT COUNT(*) as total FROM tasks');
    return count[0].total;
  }

  async getActiveUserCount() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [count] = await this.connection.execute(
      'SELECT COUNT(DISTINCT user_id) as total FROM tasks WHERE created_at >= ?',
      [thirtyDaysAgo]
    );
    return count[0].total;
  }

  async getTaskCountByStatus(status) {
    const [count] = await this.connection.execute(
      'SELECT COUNT(*) as total FROM tasks WHERE status = ?',
      [status]
    );
    return count[0].total;
  }

  async getUsersByRole() {
    const [rows] = await this.connection.execute(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    return rows.map(row => ({ role: row.role, _count: { role: row.count } }));
  }

  async getTasksByStatus() {
    const [rows] = await this.connection.execute(
      'SELECT status, COUNT(*) as count FROM tasks GROUP BY status'
    );
    return rows.map(row => ({ status: row.status, _count: { status: row.count } }));
  }

  async getTasksByPriority() {
    const [rows] = await this.connection.execute(
      'SELECT priority, COUNT(*) as count FROM tasks GROUP BY priority'
    );
    return rows.map(row => ({ priority: row.priority, _count: { priority: row.count } }));
  }

  async getRecentUsers(limit = 5) {
    const [users] = await this.connection.execute(
      `SELECT u.id, u.email, u.role, u.created_at as createdAt,
              (SELECT COUNT(*) FROM tasks WHERE user_id = u.id) as taskCount
       FROM users u
       ORDER BY u.created_at DESC LIMIT ?`,
      [limit]
    );
    return users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      _count: { tasks: user.taskCount }
    }));
  }

  async getRecentTasks(limit = 5) {
    const [tasks] = await this.connection.execute(
      `SELECT t.*, u.id as userId, u.email as userEmail
       FROM tasks t
       LEFT JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC LIMIT ?`,
      [limit]
    );
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
      user: task.userId ? {
        id: task.userId,
        email: task.userEmail
      } : null
    }));
  }

  async getUserGrowth(startDate, endDate) {
    let query = 'SELECT created_at as createdAt FROM users';
    const params = [];
    const conditions = [];

    if (startDate || endDate) {
      if (startDate) {
        conditions.push('created_at >= ?');
        params.push(startDate);
      }
      if (endDate) {
        conditions.push('created_at <= ?');
        params.push(endDate);
      }
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at ASC';
    const [rows] = await this.connection.execute(query, params);
    return rows;
  }

  async getUsersWithTasksCount() {
    const [count] = await this.connection.execute(
      'SELECT COUNT(DISTINCT u.id) as total FROM users u INNER JOIN tasks t ON u.id = t.user_id'
    );
    return count[0].total;
  }

  async getNewUsersCount(startDate, endDate) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [count] = await this.connection.execute(
      'SELECT COUNT(*) as total FROM users WHERE created_at >= ?',
      [thirtyDaysAgo]
    );
    return count[0].total;
  }

  async getTasksByUserId(userId, skip = 0, take = 10, status = null) {
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(take), skip);

    const [tasks] = await this.connection.execute(query, params);
    
    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ? AND status = ?'
      : 'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?';
    const countParams = status ? [userId, status] : [userId];
    const [count] = await this.connection.execute(countQuery, countParams);

    return {
      tasks,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: parseInt(take),
        total: count[0].total,
        totalPages: Math.ceil(count[0].total / take)
      }
    };
  }

  async getAverageTasksPerUser() {
    const [rows] = await this.connection.execute(
      'SELECT AVG(task_count) as avg FROM (SELECT COUNT(*) as task_count FROM tasks GROUP BY user_id) as counts'
    );
    return rows[0].avg ? rows[0].avg.toFixed(2) : 0;
  }

  async getTaskCompletionRate() {
    const [total] = await this.connection.execute('SELECT COUNT(*) as total FROM tasks');
    if (total[0].total === 0) return 0;

    const [completed] = await this.connection.execute(
      'SELECT COUNT(*) as total FROM tasks WHERE status = "completed"'
    );
    return ((completed[0].total / total[0].total) * 100).toFixed(2);
  }
}

module.exports = MySQLRepository;
