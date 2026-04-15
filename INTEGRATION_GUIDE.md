# Frontend-Backend Integration Guide

## Overview
This guide explains how to set up and run the integrated Task Management application with React frontend and Node.js backend.

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Database (PostgreSQL 12+, MySQL 8+, or MongoDB 4.4+)

## Backend Setup

### 1. Environment Configuration
Copy the example environment file and configure it:

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
- Choose your database type (postgres, mysql, or mongodb)
- Set database connection URL based on your chosen database
- Configure JWT secret (use a strong random string in production)
- Set port (default: 8000) and environment variables

#### Database Configuration Options:

**PostgreSQL (Default):**
```env
DB_TYPE=postgres
POSTGRES_URL="postgresql://username:password@localhost:5432/task_management"
```

**MySQL:**
```env
DB_TYPE=mysql
MYSQL_URL="mysql://username:password@localhost:3307/task_management"
```

**MongoDB:**
```env
DB_TYPE=mongodb
MONGODB_URL="mongodb://localhost:27017/task_management"
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Database Setup

#### PostgreSQL
```bash
# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run seed
```

#### MySQL
```bash
# The backend will auto-create the database on first run
# Ensure MySQL is running and credentials are correct in .env
```

#### MongoDB
```bash
# MongoDB will auto-create collections on first run
# Ensure MongoDB is running
```

### 4. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:8000` (or your configured PORT).

API Documentation available at: `http://localhost:8000/api-docs`

## Frontend Setup

### 1. Environment Configuration
Create a `.env` file in the frontend directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your backend URL:
```
VITE_API_URL=http://localhost:8000/api
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start Frontend Server
```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

The frontend will run on `http://localhost:5173` (default Vite port).

## Running Both Services

### Option 1: Separate Terminals
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Option 2: Using Docker
```bash
# From project root (uses PostgreSQL by default)
docker-compose up -d
```

To use MySQL or MongoDB instead, modify `docker-compose.yml` to uncomment the desired database service and update the backend environment variables accordingly.

## API Integration

The frontend is configured to communicate with the backend via the API client in `src/utils/api.js`:

### Authentication API
- `authAPI.register(data)` - Register new user
- `authAPI.login(data)` - Login user
- `authAPI.getProfile()` - Get current user profile

### Task API
- `taskAPI.getMyTasks(params)` - Get current user's tasks
- `taskAPI.getAllTasks(params)` - Get all tasks (admin only)
- `taskAPI.getTask(id)` - Get specific task
- `taskAPI.createTask(data)` - Create new task
- `taskAPI.updateTask(id, data)` - Update task
- `taskAPI.deleteTask(id)` - Delete task

### Admin API
- `adminAPI.getDashboardStats()` - Get dashboard analytics (overview, users by role, tasks by status/priority, recent users/tasks)
- `adminAPI.getUserStats(params)` - Get user statistics (total, active, new users, user growth)
- `adminAPI.getTaskStats(params)` - Get task statistics (total, completion rate, tasks by status/priority)
- `adminAPI.getAllUsers(params)` - Get all users with pagination, search, and role filtering
- `adminAPI.getUserById(id)` - Get specific user with their tasks
- `adminAPI.createUser(data)` - Create new user
- `adminAPI.updateUserRole(id, role)` - Update user role
- `adminAPI.deleteUser(id)` - Delete user
- `adminAPI.getUserTasks(id, params)` - Get user's tasks
- `adminAPI.bulkUpdateRoles(data)` - Bulk update user roles
- `adminAPI.bulkDeleteUsers(data)` - Bulk delete users

## CORS Configuration

The backend is configured to allow requests from the frontend:
- Development: `http://localhost:5173`
- Production: Set via `FRONTEND_URL` environment variable

## Authentication Flow

1. User registers or logs in via frontend
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. API client automatically includes token in request headers
5. Backend validates token on protected routes
6. On 401 error, frontend redirects to login

## Testing the Integration

### 1. Test Backend Health
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Test Authentication
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","role":"USER"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

Note: Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.

### 3. Test Frontend Integration
1. Open browser to `http://localhost:5173`
2. Register a new account
3. Login with credentials
4. Create, edit, and delete tasks
5. Verify data persists in backend database
6. For admin users, test admin dashboard, analytics, and user management features

### 4. Automated API Testing
Run the comprehensive API test suite:
```bash
node api-test.js
```

This will test all 22 API endpoints including authentication, tasks, admin analytics, and user management.

## Troubleshooting

### Backend Issues
- **Database connection failed**: Check database is running and credentials in `.env` are correct
- **Port already in use**: Change PORT in `.env` (default: 8000) or stop conflicting service
- **Migration errors**: Drop and recreate database, then run migrations again (PostgreSQL/MySQL only)
- **Multi-database switching**: Ensure DB_TYPE matches your database URL and restart the server

### Frontend Issues
- **CORS errors**: Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- **API connection failed**: Check `VITE_API_URL` in frontend `.env` points to correct backend URL (default: http://localhost:8000/api)
- **Authentication errors**: Clear localStorage and login again
- **Admin features not accessible**: Ensure user has ADMIN role

### Common Issues
- **401 Unauthorized**: Token expired or invalid - logout and login again
- **403 Forbidden**: User lacks required permissions - check role assignments
- **500 Internal Server Error**: Check backend logs for detailed error messages

## Security Notes

### Development
- Rate limiting is bypassed in development mode
- CORS allows localhost origins
- Detailed error messages shown

### Production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable rate limiting
- Restrict CORS to specific origins
- Use HTTPS
- Keep dependencies updated
- Run `npm audit` regularly

## Next Steps

1. Configure your database in backend `.env` (PostgreSQL, MySQL, or MongoDB)
2. Start both backend and frontend servers
3. Register a user and test the application
4. For admin testing, register an admin user and explore admin dashboard, analytics, and user management
5. Run `node api-test.js` to verify all API endpoints are working
6. Add additional features as needed
