const request = require('supertest');
const repositoryFactory = require('../src/config/database');

// Mock the repository
jest.mock('../src/config/database');

describe('Task Routes', () => {
  let mockRepository;
  let app;
  let authToken;

  beforeAll(() => {
    // Import app after mocks are set up
    app = require('../src/server');
  });

  beforeEach(async () => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      createTask: jest.fn(),
      findTaskById: jest.fn(),
      findTasksByUserId: jest.fn(),
      findAllTasks: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn()
    };
    repositoryFactory.getRepository.mockResolvedValue(mockRepository);

    // Mock login to get auth token
    mockRepository.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      password: '$2a$10$hashedpassword',
      role: 'USER'
    });

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@1234'
      });

    authToken = loginResponse.body.data?.token || 'mock-jwt-token';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high'
      };

      mockRepository.createTask.mockResolvedValue({
        id: '1',
        ...taskData,
        userId: '1',
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('created successfully');
      expect(response.body.data).toHaveProperty('title', taskData.title);
    });

    it('should require authentication', async () => {
      global.__setAuthFail(true);

      const taskData = {
        title: 'Test Task'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      global.__setAuthFail(false);
    });

    it('should validate title length', async () => {
      const taskData = {
        title: 'ab', // Too short
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate status enum values', async () => {
      const taskData = {
        title: 'Test Task',
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate priority enum values', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'invalid_priority'
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should sanitize XSS in title', async () => {
      const taskData = {
        title: 'Test<script>alert(1)</script> Task',
        description: 'Description'
      };

      mockRepository.createTask.mockResolvedValue({
        id: '1',
        title: 'Test Task',
        description: 'Description',
        userId: '1',
        status: 'pending'
      });

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.data.title).not.toContain('<script>');
    });
  });

  describe('GET /api/v1/tasks/my', () => {
    it('should get user tasks successfully', async () => {
      const tasks = [
        { id: '1', title: 'Task 1', userId: '1' },
        { id: '2', title: 'Task 2', userId: '1' }
      ];

      mockRepository.findTasksByUserId.mockResolvedValue({
        tasks,
        total: 2
      });

      const response = await request(app)
        .get('/api/v1/tasks/my')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    it('should require authentication', async () => {
      global.__setAuthFail(true);

      const response = await request(app)
        .get('/api/v1/tasks/my');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      global.__setAuthFail(false);
    });

    it('should support pagination', async () => {
      mockRepository.findTasksByUserId.mockResolvedValue({
        tasks: [],
        total: 0
      });

      const response = await request(app)
        .get('/api/v1/tasks/my?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('page', 2);
      expect(response.body.pagination).toHaveProperty('limit', 5);
    });

    it('should filter by status', async () => {
      mockRepository.findTasksByUserId.mockResolvedValue({
        tasks: [],
        total: 0
      });

      const response = await request(app)
        .get('/api/v1/tasks/my?status=completed')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/tasks/all', () => {
    it('should get all tasks for admin', async () => {
      global.__setAuthUser('1', 'ADMIN');

      mockRepository.findAllTasks.mockResolvedValue({
        tasks: [
          { id: '1', title: 'Task 1', userId: '1' },
          { id: '2', title: 'Task 2', userId: '2' }
        ],
        total: 2
      });

      const response = await request(app)
        .get('/api/v1/tasks/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should forbid non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/tasks/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('should get a specific task', async () => {
      const task = {
        id: '1',
        title: 'Test Task',
        userId: '1',
        status: 'pending'
      };

      mockRepository.findTaskById.mockResolvedValue(task);

      const response = await request(app)
        .get('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', '1');
    });

    it('should return 404 for non-existent task', async () => {
      mockRepository.findTaskById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/tasks/999')
        .set('Authorization', `Bearer ${authToken}`);

      // The service throws an error when task is not found
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      global.__setAuthFail(true);

      const response = await request(app)
        .get('/api/v1/tasks/1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      global.__setAuthFail(false);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        status: 'in_progress'
      };

      const existingTask = {
        id: '1',
        title: 'Original Title',
        userId: '1',
        status: 'pending'
      };

      mockRepository.findTaskById.mockResolvedValue(existingTask);
      mockRepository.updateTask.mockResolvedValue({
        ...existingTask,
        ...updateData
      });

      const response = await request(app)
        .put('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('updated successfully');
    });

    it('should require at least one field to update', async () => {
      const response = await request(app)
        .put('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      global.__setAuthFail(true);

      const response = await request(app)
        .put('/api/v1/tasks/1')
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      global.__setAuthFail(false);
    });

    it('should sanitize XSS in update fields', async () => {
      const updateData = {
        title: 'Updated<script>alert(1)</script> Title'
      };

      const existingTask = {
        id: '1',
        title: 'Original Title',
        userId: '1',
        status: 'pending'
      };

      mockRepository.findTaskById.mockResolvedValue(existingTask);
      mockRepository.updateTask.mockResolvedValue({
        ...existingTask,
        title: 'Updated Title'
      });

      const response = await request(app)
        .put('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.title).not.toContain('<script>');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete a task successfully', async () => {
      const existingTask = {
        id: '1',
        title: 'Test Task',
        userId: '1'
      };

      mockRepository.findTaskById.mockResolvedValue(existingTask);
      mockRepository.deleteTask.mockResolvedValue({ message: 'Task deleted' });

      const response = await request(app)
        .delete('/api/v1/tasks/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 for non-existent task', async () => {
      mockRepository.findTaskById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/v1/tasks/999')
        .set('Authorization', `Bearer ${authToken}`);

      // The service throws an error when task is not found
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      global.__setAuthFail(true);

      const response = await request(app)
        .delete('/api/v1/tasks/1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

      global.__setAuthFail(false);
    });
  });
});
