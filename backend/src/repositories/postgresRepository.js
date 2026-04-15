const BaseRepository = require('./baseRepository');
const logger = require('../config/logger');

class PostgresRepository extends BaseRepository {
  constructor(prismaClient) {
    super(prismaClient);
    this.prisma = prismaClient;
  }

  // User methods
  async findByEmail(email) {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findById(id) {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  async create(data) {
    return await this.prisma.user.create({
      data
    });
  }

  async findAll(skip = 0, take = 10) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      this.prisma.user.count()
    ]);
    
    return { users, total };
  }

  async updateRole(id, role) {
    return await this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });
  }

  async delete(id) {
    return await this.prisma.user.delete({
      where: { id }
    });
  }

  // Task methods
  async findTaskById(id) {
    return await this.prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async findTasksByUserId(userId, skip = 0, take = 10, status = null) {
    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.task.count({ where })
    ]);
    
    return { tasks, total };
  }

  async createTask(data) {
    return await this.prisma.task.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async updateTask(id, data) {
    return await this.prisma.task.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async deleteTask(id) {
    return await this.prisma.task.delete({
      where: { id }
    });
  }

  async findAllTasks(skip = 0, take = 10, status = null) {
    const where = {};
    if (status) {
      where.status = status;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      }),
      this.prisma.task.count({ where })
    ]);
    
    return { tasks, total };
  }

  // Admin-specific methods
  async findAllWithFilters(skip = 0, take = 10, search = null, role = null) {
    const where = {};
    if (search) {
      where.email = {
        contains: search,
        mode: 'insensitive'
      };
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: parseInt(take),
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { tasks: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

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
    const result = await this.prisma.user.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    return { deletedCount: result.count };
  }

  async updateManyRoles(ids, role) {
    const result = await this.prisma.user.updateMany({
      where: {
        id: { in: ids }
      },
      data: { role }
    });
    return { updatedCount: result.count };
  }

  async findByIdWithTasks(id) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  // Analytics methods
  async getUserCount() {
    return await this.prisma.user.count();
  }

  async getTaskCount() {
    return await this.prisma.task.count();
  }

  async getActiveUserCount() {
    return await this.prisma.user.count({
      where: {
        tasks: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });
  }

  async getTaskCountByStatus(status) {
    return await this.prisma.task.count({
      where: { status }
    });
  }

  async getUsersByRole() {
    return await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });
  }

  async getTasksByStatus() {
    return await this.prisma.task.groupBy({
      by: ['status'],
      _count: { status: true }
    });
  }

  async getTasksByPriority() {
    return await this.prisma.task.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });
  }

  async getRecentUsers(limit = 5) {
    return await this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tasks: true }
        }
      }
    });
  }

  async getRecentTasks(limit = 5) {
    return await this.prisma.task.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
  }

  async getUserGrowth(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return await this.prisma.user.findMany({
      where,
      select: {
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async getUsersWithTasksCount() {
    return await this.prisma.user.count({
      where: {
        tasks: {
          some: {}
        }
      }
    });
  }

  async getNewUsersCount(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    return await this.prisma.user.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
  }

  async getTasksByUserId(userId, skip = 0, take = 10, status = null) {
    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: parseInt(take),
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.task.count({ where })
    ]);

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
    const results = await this.prisma.task.groupBy({
      by: ['userId'],
      _count: { userId: true }
    });

    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r._count.userId, 0);
    return (total / results.length).toFixed(2);
  }

  async getTaskCompletionRate() {
    const total = await this.prisma.task.count();
    if (total === 0) return 0;

    const completed = await this.prisma.task.count({
      where: { status: 'completed' }
    });

    return ((completed / total) * 100).toFixed(2);
  }
}

module.exports = PostgresRepository;
