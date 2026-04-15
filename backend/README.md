# Task Management API

A scalable REST API with authentication, role-based access control, and comprehensive error handling.

## Features

- **Multi-Database Support**: Switch between PostgreSQL, MySQL, and MongoDB via environment configuration
- **Authentication**: JWT-based authentication with secure password hashing
- **Role-Based Access Control**: User and Admin roles with different permissions
- **Admin Analytics**: Dashboard statistics, user analytics, and task analytics for administrators
- **User Management**: Admin can manage users (create, update roles, delete, bulk operations)
- **RESTful API Design**: Following REST principles with proper HTTP status codes
- **API Versioning**: Versioned API endpoints for future scalability
- **Input Validation**: Joi-based request validation
- **Error Handling**: Centralized error handling with detailed error messages
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting, and secure JWT handling
- **Logging**: Winston-based logging system
- **Repository Pattern**: Clean architecture with separation of concerns
- **Database Abstraction**: Repository pattern with adapter pattern for multiple databases

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL, MySQL, or MongoDB (configurable)
- **ORM/Drivers**: Prisma (for PostgreSQL/MySQL), MongoDB Driver (for MongoDB)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema (for PostgreSQL/MySQL)
├── src/
│   ├── config/
│   │   ├── database.js        # Database factory/export
│   │   ├── databaseManager.js # Multi-database connection manager
│   │   ├── repositoryFactory.js # Repository factory pattern
│   │   └── logger.js          # Winston logger configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication controllers
│   │   ├── taskController.js  # Task controllers
│   │   ├── adminAnalyticsController.js # Admin analytics controllers
│   │   └── adminUserController.js # Admin user management controllers
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication & authorization
│   │   ├── errorHandler.js    # Centralized error handling
│   │   └── validator.js       # Request validation
│   ├── repositories/
│   │   ├── baseRepository.js  # Base repository interface
│   │   ├── postgresRepository.js # PostgreSQL implementation
│   │   ├── mysqlRepository.js  # MySQL implementation
│   │   ├── mongodbRepository.js # MongoDB implementation
│   │   ├── userRepository.js  # User repository
│   │   └── taskRepository.js  # Task repository
│   ├── routes/
│   │   ├── index.js           # Main routes file
│   │   └── v1/
│   │       ├── index.js       # v1 routes
│   │       ├── authRoutes.js  # Authentication endpoints
│   │       ├── taskRoutes.js  # Task endpoints
│   │       └── adminRoutes.js # Admin analytics and user management endpoints
│   ├── services/
│   │   ├── authService.js     # Authentication business logic
│   │   └── taskService.js     # Task business logic
│   ├── server.js              # Express server setup
│   └── swagger.js             # Swagger configuration
├── logs/                      # Log files
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd node-assignments/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration. Choose your database type:

### Option 1: PostgreSQL (Default)
```env
DB_TYPE=postgres
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://username:password@localhost:5432/task_management?schema=public"
```

### Option 2: MySQL
```env
DB_TYPE=mysql
MYSQL_URL="mysql://username:password@localhost:3306/task_management"
DB_PROVIDER=mysql
DATABASE_URL="mysql://username:password@localhost:3306/task_management"
```

### Option 3: MongoDB
```env
DB_TYPE=mongodb
MONGODB_URL="mongodb://localhost:27017/task_management"
```

Common configuration (required for all databases):
```env
PORT=8000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

4. **Set up your chosen database**

#### For PostgreSQL:
- Install PostgreSQL
- Create a database named `task_management`
- Update the `POSTGRES_URL` in `.env`
- Run migrations: `npm run prisma:migrate`
- Generate Prisma client: `npm run prisma:generate`

#### For MySQL:
- Install MySQL
- Create a database named `task_management`
- Update the `MYSQL_URL` in `.env`
- Run migrations: `npm run prisma:migrate`
- Generate Prisma client: `npm run prisma:generate`

#### For MongoDB:
- Install MongoDB
- Create a database named `task_management` (MongoDB creates it automatically)
- Update the `MONGODB_URL` in `.env`
- No migrations needed for MongoDB

## Multi-Database Support

This API supports multiple database backends through the Repository Pattern and Adapter Pattern. You can switch between databases by simply changing the `DB_TYPE` environment variable.

### Architecture

The multi-database support is implemented using:

1. **Database Manager**: Handles connection to different database types
2. **Repository Factory**: Returns the appropriate repository implementation based on `DB_TYPE`
3. **Base Repository Interface**: Defines the contract all repositories must implement
4. **Database-Specific Repositories**: 
   - `PostgresRepository`: Uses Prisma ORM
   - `MySQLRepository`: Uses MySQL2 driver with raw SQL
   - `MongoDBRepository`: Uses MongoDB native driver

### How It Works

1. On server startup, the `DatabaseManager` reads `DB_TYPE` from environment variables
2. The `RepositoryFactory` creates the appropriate repository instance
3. Services use the repository interface without knowing which database is being used
4. All database operations go through the repository abstraction layer

### Switching Databases

To switch between databases:

1. Update `.env` file with the desired `DB_TYPE` and corresponding connection string
2. Restart the server
3. The application will automatically use the new database backend

**Example: Switch from PostgreSQL to MySQL**
```env
# Change from:
DB_TYPE=postgres
POSTGRES_URL="postgresql://user:pass@localhost:5432/task_management"

# To:
DB_TYPE=mysql
MYSQL_URL="mysql://user:pass@localhost:3306/task_management"
```

### Database-Specific Notes

- **PostgreSQL/MySQL**: Use Prisma ORM with migrations. Run `npm run prisma:migrate` after schema changes.
- **MongoDB**: No migrations needed. Schema is flexible and handled at the application level.
- **Data Migration**: When switching databases, you'll need to migrate data manually or use a migration tool.

## Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**View Prisma Studio (database GUI):**
```bash
npm run prisma:studio
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/api-docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (protected)

### Tasks (`/api/v1/tasks`)

- `POST /api/v1/tasks` - Create a new task (protected)
- `GET /api/v1/tasks/my` - Get current user's tasks (protected)
- `GET /api/v1/tasks/all` - Get all tasks (Admin only)
- `GET /api/v1/tasks/:id` - Get a specific task (protected)
- `PUT /api/v1/tasks/:id` - Update a task (protected)
- `DELETE /api/v1/tasks/:id` - Delete a task (protected)

### Admin Analytics (`/api/v1/admin/analytics`) - Admin Only

- `GET /api/v1/admin/analytics/dashboard` - Get dashboard statistics (overview, users by role, tasks by status/priority, recent users/tasks)
- `GET /api/v1/admin/analytics/users` - Get user statistics (total users, new users, users with tasks, user growth by month)
- `GET /api/v1/admin/analytics/tasks` - Get task statistics (total tasks, tasks by status/priority, avg tasks per user, completion rate)

### Admin User Management (`/api/v1/admin/users`) - Admin Only

- `GET /api/v1/admin/users` - Get all users with pagination, search, and role filtering
- `GET /api/v1/admin/users/:id` - Get user by ID with their tasks
- `POST /api/v1/admin/users` - Create a new user
- `PUT /api/v1/admin/users/:id/role` - Update user role
- `DELETE /api/v1/admin/users/:id` - Delete a user
- `GET /api/v1/admin/users/:id/tasks` - Get user's tasks
- `POST /api/v1/admin/users/bulk/role` - Bulk update user roles
- `POST /api/v1/admin/users/bulk/delete` - Bulk delete users

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with a salt round of 10
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access Control**: Different permissions for USER and ADMIN roles
4. **Rate Limiting**: Protection against brute force attacks (100 requests per 15 minutes)
5. **Helmet**: Security headers for Express
6. **CORS**: Configured cross-origin resource sharing
7. **Input Validation**: All inputs are validated using Joi schemas

## Database Schema

### User
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `role` (Enum: USER, ADMIN)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Task
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (String, Optional)
- `status` (String: pending, in_progress, completed)
- `priority` (String: low, medium, high)
- `userId` (UUID, Foreign Key)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Testing with Postman

Import the API endpoints into Postman using the Swagger documentation at `/api-docs`.

Example requests:

**Register User:**
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login:**
```json
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Create Task:**
```json
POST /api/v1/tasks
Headers: Authorization: Bearer <token>
{
  "title": "Complete project",
  "description": "Build the task management API",
  "priority": "high"
}
```

**Get Dashboard Analytics (Admin):**
```json
GET /api/v1/admin/analytics/dashboard
Headers: Authorization: Bearer <admin_token>
```

**Get User Statistics (Admin):**
```json
GET /api/v1/admin/analytics/users?startDate=2024-01-01&endDate=2024-12-31
Headers: Authorization: Bearer <admin_token>
```

**Get All Users (Admin):**
```json
GET /api/v1/admin/users?page=1&limit=10&search=user@example.com&role=USER
Headers: Authorization: Bearer <admin_token>
```

**Create User (Admin):**
```json
POST /api/v1/admin/users
Headers: Authorization: Bearer <admin_token>
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Update User Role (Admin):**
```json
PUT /api/v1/admin/users/:id/role
Headers: Authorization: Bearer <admin_token>
{
  "role": "ADMIN"
}
```

**Bulk Update User Roles (Admin):**
```json
POST /api/v1/admin/users/bulk/role
Headers: Authorization: Bearer <admin_token>
{
  "userIds": ["user-id-1", "user-id-2", "user-id-3"],
  "role": "ADMIN"
}
```

**Delete User (Admin):**
```json
DELETE /api/v1/admin/users/:id
Headers: Authorization: Bearer <admin_token>
```

## Scalability Considerations

This API is designed with scalability in mind:

1. **Repository Pattern**: Clean separation of concerns makes it easy to add new features
2. **API Versioning**: Versioned endpoints allow for backward compatibility
3. **Stateless Design**: JWT authentication enables horizontal scaling
4. **Database Indexing**: Proper indexes on frequently queried fields
5. **Modular Structure**: Easy to extract services into microservices
6. **Environment Configuration**: Easy deployment across different environments

### Future Scalability Enhancements

- **Caching**: Add Redis for frequently accessed data
- **Load Balancing**: Deploy behind a load balancer (Nginx, AWS ALB)
- **Microservices**: Extract authentication, tasks, and other services
- **Message Queue**: Add RabbitMQ/Kafka for asynchronous processing
- **CDN**: Serve static assets through CDN
- **Database Sharding**: Split database across multiple servers for high volume
- **Containerization**: Docker and Kubernetes for deployment
- **Monitoring**: Add Prometheus, Grafana for monitoring
- **API Gateway**: Use Kong or AWS API Gateway for routing and rate limiting

## Deployment

### Docker Deployment (Optional)

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run prisma:generate
EXPOSE 8000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t task-api .
docker run -p 8000:8000 --env-file .env task-api
```

## Error Handling

The API uses centralized error handling with appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## License

ISC
