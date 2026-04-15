const { ObjectId } = require('mongodb');
const BaseRepository = require('./baseRepository');
const logger = require('../config/logger');

class MongoDBRepository extends BaseRepository {
  constructor(mongoClient) {
    super(mongoClient);
    this.client = mongoClient;
    this.db = mongoClient.db();
    this.usersCollection = this.db.collection('users');
    this.tasksCollection = this.db.collection('tasks');
  }

  // Helper method to convert string ID to ObjectId
  toObjectId(id) {
    try {
      return new ObjectId(id);
    } catch (error) {
      return id;
    }
  }

  // User methods
  async findByEmail(email) {
    const user = await this.usersCollection.findOne(
      { email },
      { projection: { password: 0 } }
    );
    if (user) {
      user.id = user._id.toString();
      // Keep _id for compatibility with MongoDB operations
    }
    return user;
  }

  async findByEmailWithPassword(email) {
    const user = await this.usersCollection.findOne({ email });
    if (user) {
      user.id = user._id.toString();
      // Keep _id for compatibility with MongoDB operations
    }
    return user;
  }

  async findById(id) {
    const user = await this.usersCollection.findOne(
      { _id: this.toObjectId(id) },
      { projection: { password: 0 } }
    );
    if (user) {
      user.id = user._id.toString();
      // Keep _id for compatibility with MongoDB operations
    }
    return user;
  }

  async create(data) {
    const result = await this.usersCollection.insertOne({
      email: data.email,
      password: data.password,
      role: data.role || 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.findById(result.insertedId.toString());
  }

  async findAll(skip = 0, take = 10) {
    const users = await this.usersCollection
      .find({}, { projection: { password: 0 } })
      .skip(skip)
      .limit(take)
      .toArray();
    
    users.forEach(user => {
      user.id = user._id.toString();
      // Keep _id for compatibility
    });

    const total = await this.usersCollection.countDocuments();
    return { users, total };
  }

  async updateRole(id, role) {
    await this.usersCollection.updateOne(
      { _id: this.toObjectId(id) },
      { $set: { role, updatedAt: new Date() } }
    );
    return this.findById(id);
  }

  async delete(id) {
    await this.usersCollection.deleteOne({ _id: this.toObjectId(id) });
    return { message: 'User deleted' };
  }

  // Task methods
  async findTaskById(id) {
    const task = await this.tasksCollection.findOne(
      { _id: this.toObjectId(id) }
    );
    
    if (task) {
      task.id = task._id.toString();
      delete task._id;
      
      // Get user information
      if (task.userId) {
        const user = await this.usersCollection.findOne(
          { _id: this.toObjectId(task.userId) },
          { projection: { password: 0 } }
        );
        if (user) {
          task.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          };
        }
      }
    }
    return task;
  }

  async findTasksByUserId(userId, skip = 0, take = 10, status = null) {
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const tasks = await this.tasksCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .toArray();

    const total = await this.tasksCollection.countDocuments(query);

    // Populate user information for each task
    for (const task of tasks) {
      task.id = task._id.toString();
      delete task._id;
      
      if (task.userId) {
        const user = await this.usersCollection.findOne(
          { _id: this.toObjectId(task.userId) },
          { projection: { password: 0 } }
        );
        if (user) {
          task.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          };
        }
      }
    }

    return { tasks, total };
  }

  async createTask(data) {
    const result = await this.tasksCollection.insertOne({
      title: data.title,
      description: data.description || null,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      userId: data.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return this.findTaskById(result.insertedId.toString());
  }

  async updateTask(id, data) {
    const updateData = { ...data, updatedAt: new Date() };
    delete updateData.id;
    
    await this.tasksCollection.updateOne(
      { _id: this.toObjectId(id) },
      { $set: updateData }
    );
    return this.findTaskById(id);
  }

  async deleteTask(id) {
    await this.tasksCollection.deleteOne({ _id: this.toObjectId(id) });
    return { message: 'Task deleted' };
  }

  async findAllTasks(skip = 0, take = 10, status = null) {
    const query = {};
    if (status) {
      query.status = status;
    }

    const tasks = await this.tasksCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .toArray();

    const total = await this.tasksCollection.countDocuments(query);

    // Populate user information for each task
    for (const task of tasks) {
      task.id = task._id.toString();
      delete task._id;
      
      if (task.userId) {
        const user = await this.usersCollection.findOne(
          { _id: this.toObjectId(task.userId) },
          { projection: { password: 0 } }
        );
        if (user) {
          task.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role
          };
        }
      }
    }

    return { tasks, total };
  }

  // Admin-specific methods
  async findAllWithFilters(skip = 0, take = 10, search = null, role = null) {
    const query = {};
    if (search) {
      // Escape regex special characters to prevent NoSQL injection
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.email = { $regex: escapedSearch, $options: 'i' };
    }
    if (role) {
      query.role = role;
    }

    const users = await this.usersCollection
      .find(query, { projection: { password: 0 } })
      .skip(skip)
      .limit(parseInt(take))
      .sort({ createdAt: -1 })
      .toArray();

    users.forEach(user => {
      user.id = user._id.toString();
      delete user._id;
    });

    const total = await this.usersCollection.countDocuments(query);

    // Add task counts to each user
    for (const user of users) {
      const taskCount = await this.tasksCollection.countDocuments({ userId: user.id });
      user._count = { tasks: taskCount };
    }

    return {
      users,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: parseInt(take),
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  async deleteMany(ids) {
    const objectIds = ids.map(id => this.toObjectId(id));
    const result = await this.usersCollection.deleteMany({ _id: { $in: objectIds } });
    return { deletedCount: result.deletedCount };
  }

  async updateManyRoles(ids, role) {
    const objectIds = ids.map(id => this.toObjectId(id));
    const result = await this.usersCollection.updateMany(
      { _id: { $in: objectIds } },
      { $set: { role, updatedAt: new Date() } }
    );
    return { updatedCount: result.modifiedCount };
  }

  async findByIdWithTasks(id) {
    const user = await this.usersCollection.findOne(
      { _id: this.toObjectId(id) },
      { projection: { password: 0 } }
    );

    if (user) {
      user.id = user._id.toString();
      delete user._id;

      const tasks = await this.tasksCollection
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .toArray();

      user.tasks = tasks.map(task => {
        task.id = task._id.toString();
        delete task._id;
        return {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          createdAt: task.createdAt
        };
      });
    }

    return user;
  }

  // Analytics methods
  async getUserCount() {
    return await this.usersCollection.countDocuments();
  }

  async getTaskCount() {
    return await this.tasksCollection.countDocuments();
  }

  async getActiveUserCount() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await this.usersCollection.distinct('userId', {
      createdAt: { $gte: thirtyDaysAgo }
    });
    return activeUsers.length;
  }

  async getTaskCountByStatus(status) {
    return await this.tasksCollection.countDocuments({ status });
  }

  async getUsersByRole() {
    const pipeline = [
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', _count: { role: '$count' }, _id: 0 } }
    ];
    return await this.usersCollection.aggregate(pipeline).toArray();
  }

  async getTasksByStatus() {
    const pipeline = [
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', _count: { status: '$count' }, _id: 0 } }
    ];
    return await this.tasksCollection.aggregate(pipeline).toArray();
  }

  async getTasksByPriority() {
    const pipeline = [
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $project: { priority: '$_id', _count: { priority: '$count' }, _id: 0 } }
    ];
    return await this.tasksCollection.aggregate(pipeline).toArray();
  }

  async getRecentUsers(limit = 5) {
    const users = await this.usersCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const result = [];
    for (const user of users) {
      const taskCount = await this.tasksCollection.countDocuments({ userId: user._id.toString() });
      result.push({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        _count: { tasks: taskCount }
      });
    }

    return result;
  }

  async getRecentTasks(limit = 5) {
    const tasks = await this.tasksCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const result = [];
    for (const task of tasks) {
      const user = await this.usersCollection.findOne(
        { _id: this.toObjectId(task.userId) },
        { projection: { password: 0 } }
      );
      result.push({
        id: task._id.toString(),
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        user: user ? {
          id: user._id.toString(),
          email: user.email
        } : null
      });
    }

    return result;
  }

  async getUserGrowth(startDate, endDate) {
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    return await this.usersCollection
      .find(query, { projection: { createdAt: 1 } })
      .sort({ createdAt: 1 })
      .toArray();
  }

  async getUsersWithTasksCount() {
    return await this.usersCollection.countDocuments({
      _id: { $in: await this.tasksCollection.distinct('userId') }
    });
  }

  async getNewUsersCount(startDate, endDate) {
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    query.createdAt = {
      ...query.createdAt,
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    return await this.usersCollection.countDocuments(query);
  }

  async getTasksByUserId(userId, skip = 0, take = 10, status = null) {
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const tasks = await this.tasksCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(take))
      .toArray();

    tasks.forEach(task => {
      task.id = task._id.toString();
      delete task._id;
    });

    const total = await this.tasksCollection.countDocuments(query);

    return {
      tasks,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: parseInt(take),
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  async getAverageTasksPerUser() {
    const pipeline = [
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $group: { _id: null, avgCount: { $avg: '$count' } } }
    ];
    const result = await this.tasksCollection.aggregate(pipeline).toArray();
    return result.length > 0 ? result[0].avgCount.toFixed(2) : 0;
  }

  async getTaskCompletionRate() {
    const total = await this.tasksCollection.countDocuments();
    if (total === 0) return 0;

    const completed = await this.tasksCollection.countDocuments({ status: 'completed' });
    return ((completed / total) * 100).toFixed(2);
  }
}

module.exports = MongoDBRepository;
