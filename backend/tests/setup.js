// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_testing_purposes_only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '3001';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: '1', role: 'USER' })
}));

// Mock database for testing
jest.mock('../src/config/database', () => {
  const mockRepository = {
    // User methods
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllWithFilters: jest.fn(),
    updateRole: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    updateManyRoles: jest.fn(),
    findByIdWithTasks: jest.fn(),
    // Task methods
    findTaskById: jest.fn(),
    findTasksByUserId: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    findAllTasks: jest.fn(),
    // Analytics methods
    getUserCount: jest.fn(),
    getTaskCount: jest.fn(),
    getActiveUserCount: jest.fn(),
    getTaskCountByStatus: jest.fn(),
    getUsersByRole: jest.fn(),
    getTasksByStatus: jest.fn(),
    getTasksByPriority: jest.fn(),
    getRecentUsers: jest.fn(),
    getRecentTasks: jest.fn(),
    getUserGrowth: jest.fn(),
    getUsersWithTasksCount: jest.fn(),
    getNewUsersCount: jest.fn(),
    getTasksByUserId: jest.fn(),
    getAverageTasksPerUser: jest.fn(),
    getTaskCompletionRate: jest.fn()
  };

  return {
    getRepository: jest.fn().mockResolvedValue(mockRepository),
    disconnect: jest.fn().mockResolvedValue(undefined)
  };
});

// Mock the auth middleware to avoid actual JWT verification
let shouldFailAuth = false;

const mockAuthenticate = jest.fn((req, res, next) => {
  if (shouldFailAuth) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  } else {
    req.user = { userId: '1', role: 'USER' };
    next();
  }
});

const mockAuthorize = jest.fn((role) => (req, res, next) => {
  if (req.user.role === role) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access forbidden' });
  }
});

jest.mock('../src/middleware/auth', () => ({
  authenticate: mockAuthenticate,
  authorize: mockAuthorize
}));

// Export helpers to control mock behavior
global.__setAuthFail = (fail) => { shouldFailAuth = fail; };
global.__setAuthUser = (userId, role) => {
  mockAuthenticate.mockImplementationOnce((req, res, next) => {
    req.user = { userId, role };
    next();
  });
};

// Set timeout for tests
jest.setTimeout(10000);
