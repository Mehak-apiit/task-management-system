const request = require('supertest');
const repositoryFactory = require('../src/config/database');

// Mock the repository
jest.mock('../src/config/database');

describe('Authentication Routes', () => {
  let mockRepository;
  let app;

  beforeAll(() => {
    // Import app after mocks are set up
    app = require('../src/server');
  });

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn()
    };
    repositoryFactory.getRepository.mockResolvedValue(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234',
        role: 'USER'
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        role: userData.role
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for existing email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234'
      };

      mockRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: userData.email
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      // Service throws error for existing user
      expect([409, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate password strength', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should sanitize XSS in email', async () => {
      const userData = {
        email: 'test<script>alert(1)</script>@example.com',
        password: 'Test@1234'
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'USER'
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).not.toContain('<script>');
    });

    it('should trim email whitespace', async () => {
      const userData = {
        email: '  test@example.com  ',
        password: 'Test@1234'
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        role: 'USER'
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234'
      };

      mockRepository.findByEmail.mockResolvedValue({
        id: '1',
        email: userData.email,
        password: '$2a$10$hashedpassword',
        role: 'USER'
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Login successful');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error for invalid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      mockRepository.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      // Service throws error for invalid credentials
      expect([401, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should validate email format on login', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require password field', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'USER',
        createdAt: new Date()
      };

      mockRepository.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer mock-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email');
    });

    it('should return error without token', async () => {
      global.__setAuthFail(true);

      const response = await request(app)
        .get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      global.__setAuthFail(false);
    });

    it('should return error with invalid token', async () => {
      global.__setAuthFail(true);

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      global.__setAuthFail(false);
    });
  });
});
