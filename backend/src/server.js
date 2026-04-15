require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const specs = require('./swagger');
const repositoryFactory = require('./config/database');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting (bypassed in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // much higher limit in development
  message: 'Too many requests from this IP, please try again later',
  skip: (req) => process.env.NODE_ENV === 'development' // skip rate limiting entirely in development
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Initialize database connection before starting server
const startServer = async () => {
  try {
    // Check and create database if it doesn't exist (MySQL only)
    if (process.env.DB_PROVIDER === 'mysql' || process.env.DB_TYPE === 'mysql') {
      logger.info('Checking MySQL database existence...');
      const mysql = require('mysql2/promise');
      
      // Parse DATABASE_URL to get connection details
      const databaseUrl = process.env.DATABASE_URL || '';
      let dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
      };

      // Try to parse DATABASE_URL if available
      if (databaseUrl) {
        try {
          const url = new URL(databaseUrl);
          dbConfig = {
            host: url.hostname || dbConfig.host,
            user: url.username || dbConfig.user,
            password: url.password || dbConfig.password,
            port: parseInt(url.port) || 3307,
          };
        } catch (e) {
          // Use defaults if URL parsing fails
        }
      }
      
      try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query('CREATE DATABASE IF NOT EXISTS task_management');
        logger.info('Database "task_management" checked/created');
        await connection.end();
      } catch (error) {
        logger.warn('Could not auto-create database:', error.message);
        logger.warn('Please ensure MySQL is running and credentials are correct');
      }
    }

    // Initialize database connection
    await repositoryFactory.getRepository();
    logger.info(`Database connected successfully (${process.env.DB_TYPE || 'postgres'})`);

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Store server globally for tests
    if (process.env.NODE_ENV === 'test') {
      global.server = server;
    }

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await repositoryFactory.disconnect();
          logger.info('Database disconnected');
        } catch (error) {
          logger.error('Error disconnecting database:', error);
        }
        
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
