const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
const logger = require('./logger');

class DatabaseManager {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'postgres';
    this.client = null;
    this.connection = null;
  }

  async connect() {
    switch (this.dbType) {
      case 'postgres':
        return await this.connectPostgres();
      case 'mysql':
        return await this.connectMySQL();
      case 'mongodb':
        return await this.connectMongoDB();
      default:
        throw new Error(`Unsupported database type: ${this.dbType}`);
    }
  }

  async connectPostgres() {
    const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('POSTGRES_URL not configured');
    }

    this.client = new PrismaClient({
      datasources: {
        db: { url: databaseUrl }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    await this.client.$connect();
    logger.info('Connected to PostgreSQL database');
    return this.client;
  }

  async connectMySQL() {
    const databaseUrl = process.env.MYSQL_URL;
    if (!databaseUrl) {
      throw new Error('MYSQL_URL not configured');
    }

    this.connection = await mysql.createConnection(databaseUrl);
    logger.info('Connected to MySQL database');
    return this.connection;
  }

  async connectMongoDB() {
    const databaseUrl = process.env.MONGODB_URL;
    if (!databaseUrl) {
      throw new Error('MONGODB_URL not configured');
    }

    this.client = new MongoClient(databaseUrl);
    await this.client.connect();
    logger.info('Connected to MongoDB database');
    return this.client;
  }

  async disconnect() {
    switch (this.dbType) {
      case 'postgres':
        if (this.client) {
          await this.client.$disconnect();
          logger.info('Disconnected from PostgreSQL');
        }
        break;
      case 'mysql':
        if (this.connection) {
          await this.connection.end();
          logger.info('Disconnected from MySQL');
        }
        break;
      case 'mongodb':
        if (this.client) {
          await this.client.close();
          logger.info('Disconnected from MongoDB');
        }
        break;
    }
  }

  getClient() {
    if (!this.client && !this.connection) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.dbType === 'mysql' ? this.connection : this.client;
  }

  getDbType() {
    return this.dbType;
  }
}

// Singleton instance
const dbManager = new DatabaseManager();

module.exports = dbManager;
