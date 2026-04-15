const dbManager = require('./databaseManager');
const PostgresRepository = require('../repositories/postgresRepository');
const MySQLRepository = require('../repositories/mysqlRepository');
const MongoDBRepository = require('../repositories/mongodbRepository');
const logger = require('./logger');

class RepositoryFactory {
  constructor() {
    this.repository = null;
  }

  async getRepository() {
    if (this.repository) {
      return this.repository;
    }

    const dbType = dbManager.getDbType();
    const client = await dbManager.connect();

    switch (dbType) {
      case 'postgres':
        this.repository = new PostgresRepository(client);
        logger.info('Using PostgreSQL repository');
        break;
      case 'mysql':
        this.repository = new MySQLRepository(client);
        logger.info('Using MySQL repository');
        break;
      case 'mongodb':
        this.repository = new MongoDBRepository(client);
        logger.info('Using MongoDB repository');
        break;
      default:
        throw new Error(`Unsupported database type: ${dbType}`);
    }

    return this.repository;
  }

  async disconnect() {
    await dbManager.disconnect();
    this.repository = null;
  }
}

// Singleton instance
const repositoryFactory = new RepositoryFactory();

module.exports = repositoryFactory;
