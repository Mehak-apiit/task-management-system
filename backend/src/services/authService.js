const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repositoryFactory = require('../config/database');
const logger = require('../config/logger');

class AuthService {
  async getRepository() {
    return await repositoryFactory.getRepository();
  }

  async register(email, password, role = 'USER') {
    const repository = await this.getRepository();
    
    // Check if user already exists
    const existingUser = await repository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await repository.create({
      email,
      password: hashedPassword,
      role
    });

    // Generate token
    const token = this.generateToken(user.id, user.role);

    logger.info(`User registered: ${email} with ID: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async login(email, password) {
    const repository = await this.getRepository();
    
    // Find user by email (with password for authentication)
    const user = await repository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user.id, user.role);

    logger.info(`User logged in: ${email} with ID: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async getUserProfile(userId) {
    const repository = await this.getRepository();
    const user = await repository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}

module.exports = new AuthService();
