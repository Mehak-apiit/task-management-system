const API_BASE_URL = 'http://localhost:8000/api/v1';

// Test configuration
const testConfig = {
  testUser: {
    email: `testuser${Date.now()}@example.com`,
    password: 'Test123456!',
    role: 'USER'
  },
  testAdmin: {
    email: `testadmin${Date.now()}@example.com`,
    password: 'Admin123456!',
    role: 'ADMIN'
  }
};

// Store tokens and IDs for subsequent tests
let userToken = null;
let adminToken = null;
let userId = null;
let adminId = null;
let taskId = null;

// Utility function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // Merge options, ensuring body is preserved
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: defaultOptions.headers
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Request failed: ${endpoint}`, error);
    return { status: 500, data: { message: error.message } };
  }
}

// Test functions
async function testRegister(user) {
  console.log('\n=== Testing Register ===');
  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(user)
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testLogin(email, password) {
  console.log('\n=== Testing Login ===');
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testProfile(token) {
  console.log('\n=== Testing Get Profile ===');
  const result = await apiRequest('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testCreateTask(token, taskData) {
  console.log('\n=== Testing Create Task ===');
  const result = await apiRequest('/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(taskData)
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetMyTasks(token) {
  console.log('\n=== Testing Get My Tasks ===');
  const result = await apiRequest('/tasks/my', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetAllTasks(token) {
  console.log('\n=== Testing Get All Tasks (Admin) ===');
  const result = await apiRequest('/tasks/all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetTaskById(token, id) {
  console.log('\n=== Testing Get Task By ID ===');
  const result = await apiRequest(`/tasks/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testUpdateTask(token, id, taskData) {
  console.log('\n=== Testing Update Task ===');
  const result = await apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(taskData)
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testDeleteTask(token, id) {
  console.log('\n=== Testing Delete Task ===');
  const result = await apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetAdminDashboard(token) {
  console.log('\n=== Testing Admin Dashboard Analytics ===');
  const result = await apiRequest('/admin/analytics/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetUserAnalytics(token) {
  console.log('\n=== Testing User Analytics ===');
  const result = await apiRequest('/admin/analytics/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetTaskAnalytics(token) {
  console.log('\n=== Testing Task Analytics ===');
  const result = await apiRequest('/admin/analytics/tasks', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetAllUsers(token) {
  console.log('\n=== Testing Get All Users (Admin) ===');
  const result = await apiRequest('/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetUserById(token, id) {
  console.log('\n=== Testing Get User By ID ===');
  const result = await apiRequest(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testCreateUser(token, userData) {
  console.log('\n=== Testing Create User (Admin) ===');
  const result = await apiRequest('/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(userData)
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testUpdateUserRole(token, id, role) {
  console.log('\n=== Testing Update User Role ===');
  const result = await apiRequest(`/admin/users/${id}/role`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testDeleteUser(token, id) {
  console.log('\n=== Testing Delete User (Admin) ===');
  const result = await apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testGetUserTasks(token, id) {
  console.log('\n=== Testing Get User Tasks ===');
  const result = await apiRequest(`/admin/users/${id}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testBulkUpdateRoles(token, userIds, role) {
  console.log('\n=== Testing Bulk Update User Roles ===');
  const result = await apiRequest('/admin/users/bulk/role', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userIds, role })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

async function testBulkDeleteUsers(token, userIds) {
  console.log('\n=== Testing Bulk Delete Users ===');
  const result = await apiRequest('/admin/users/bulk/delete', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userIds })
  });
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result;
}

// Main test runner
async function runTests() {
  console.log('========================================');
  console.log('API Testing Suite');
  console.log('========================================');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log('========================================');

  try {
    // Test 1: Register regular user
    const registerUser = await testRegister(testConfig.testUser);
    if (registerUser.status === 201) {
      userId = registerUser.data.data.id;
    }

    // Test 2: Register admin user
    const registerAdmin = await testRegister(testConfig.testAdmin);
    if (registerAdmin.status === 201) {
      adminId = registerAdmin.data.data.id;
    }

    // Test 3: Login as regular user
    const loginUser = await testLogin(testConfig.testUser.email, testConfig.testUser.password);
    if (loginUser.status === 200) {
      userToken = loginUser.data.data.token;
    }

    // Test 4: Login as admin
    const loginAdmin = await testLogin(testConfig.testAdmin.email, testConfig.testAdmin.password);
    if (loginAdmin.status === 200) {
      adminToken = loginAdmin.data.data.token;
    }

    // Test 5: Get user profile
    await testProfile(userToken);

    // Test 6: Get admin profile
    await testProfile(adminToken);

    // Test 7: Create task as regular user
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
      priority: 'high'
    };
    const createTask = await testCreateTask(userToken, taskData);
    if (createTask.status === 201) {
      taskId = createTask.data.data.id;
    }

    // Test 8: Get my tasks
    await testGetMyTasks(userToken);

    // Test 9: Get task by ID
    if (taskId) {
      await testGetTaskById(userToken, taskId);
    }

    // Test 10: Update task
    if (taskId) {
      const updatedTaskData = {
        title: 'Updated Test Task',
        description: 'This is an updated test task',
        status: 'in_progress',
        priority: 'medium'
      };
      await testUpdateTask(userToken, taskId, updatedTaskData);
    }

    // Test 11: Get all tasks (admin only)
    await testGetAllTasks(adminToken);

    // Test 12: Admin dashboard analytics
    await testGetAdminDashboard(adminToken);

    // Test 13: User analytics
    await testGetUserAnalytics(adminToken);

    // Test 14: Task analytics
    await testGetTaskAnalytics(adminToken);

    // Test 15: Get all users (admin)
    const allUsers = await testGetAllUsers(adminToken);

    // Test 16: Get user by ID
    if (userId) {
      await testGetUserById(adminToken, userId);
    }

    // Test 17: Create user as admin
    const newUserData = {
      email: `newuser${Date.now()}@example.com`,
      password: 'NewUser123!',
      role: 'USER'
    };
    const newUser = await testCreateUser(adminToken, newUserData);

    // Test 18: Update user role
    if (userId) {
      await testUpdateUserRole(adminToken, userId, 'ADMIN');
    }

    // Test 19: Get user tasks
    if (userId) {
      await testGetUserTasks(adminToken, userId);
    }

    // Test 20: Bulk update roles (if we have multiple users)
    if (userId && newUser?.data?.data?.id) {
      await testBulkUpdateRoles(adminToken, [userId, newUser.data.data.id], 'USER');
    }

    // Test 21: Delete task
    if (taskId) {
      await testDeleteTask(userToken, taskId);
    }

    // Test 22: Delete user (admin)
    if (newUser?.data?.data?.id) {
      await testDeleteUser(adminToken, newUser.data.data.id);
    }

    console.log('\n========================================');
    console.log('All tests completed!');
    console.log('========================================');

  } catch (error) {
    console.error('Test suite failed:', error);
  }
}

// Run the tests
runTests();
