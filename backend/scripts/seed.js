require('dotenv').config();
const bcrypt = require('bcryptjs');
const repositoryFactory = require('../src/config/database');
const logger = require('../src/config/logger');

const seedData = {
  users: [
    {
      email: 'admin@example.com',
      password: 'Admin@1234',
      role: 'ADMIN'
    },
    {
      email: 'user1@example.com',
      password: 'User@1234',
      role: 'USER'
    },
    {
      email: 'user2@example.com',
      password: 'User@1234',
      role: 'USER'
    },
    {
      email: 'user3@example.com',
      password: 'User@1234',
      role: 'USER'
    }
  ],
  tasks: [
    {
      title: 'Complete project documentation',
      description: 'Write comprehensive documentation for the project',
      status: 'pending',
      priority: 'high'
    },
    {
      title: 'Fix authentication bug',
      description: 'Users unable to login with valid credentials',
      status: 'in_progress',
      priority: 'high'
    },
    {
      title: 'Implement user analytics',
      description: 'Add analytics dashboard for user activity',
      status: 'completed',
      priority: 'medium'
    },
    {
      title: 'Design database schema',
      description: 'Create optimized database schema for scalability',
      status: 'completed',
      priority: 'high'
    },
    {
      title: 'Write unit tests',
      description: 'Add comprehensive unit tests for all modules',
      status: 'pending',
      priority: 'medium'
    },
    {
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      status: 'pending',
      priority: 'low'
    },
    {
      title: 'Optimize API performance',
      description: 'Implement caching and query optimization',
      status: 'in_progress',
      priority: 'medium'
    },
    {
      title: 'Add rate limiting',
      description: 'Implement API rate limiting to prevent abuse',
      status: 'completed',
      priority: 'high'
    }
  ]
};

async function seed() {
  try {
    logger.info('Starting database seed...');

    // Get repository based on DB_TYPE
    const repository = await repositoryFactory.getRepository();
    const dbType = process.env.DB_TYPE || 'postgres';
    logger.info(`Using ${dbType} database for seeding`);

    // Seed users
    logger.info('Seeding users...');
    const createdUsers = [];
    for (const userData of seedData.users) {
      const existingUser = await repository.findByEmail(userData.email);
      if (existingUser) {
        logger.info(`User ${userData.email} already exists, skipping...`);
        createdUsers.push(existingUser);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await repository.create({
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      logger.info(`Created user: ${userData.email} (${userData.role})`);
      createdUsers.push(user);
    }

    // Seed tasks
    logger.info('Seeding tasks...');
    for (let i = 0; i < seedData.tasks.length; i++) {
      const taskData = seedData.tasks[i];
      const user = createdUsers[i % createdUsers.length]; // Distribute tasks among users

      const task = await repository.createTask({
        ...taskData,
        userId: user.id
      });
      logger.info(`Created task: ${taskData.title} for user ${user.email}`);
    }

    logger.info('Database seeding completed successfully!');

    // Disconnect from database
    await repositoryFactory.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    await repositoryFactory.disconnect();
    process.exit(1);
  }
}

// Run seeder
seed();
