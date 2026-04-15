# Task Management System

A full-stack task management application with a scalable REST API, JWT authentication, role-based access control, and a React frontend.

## 🚀 Features

### Backend
- **Multi-Database Support**: Switch between PostgreSQL, MySQL, and MongoDB via environment configuration
- **Authentication System**: JWT-based authentication with secure password hashing (bcrypt)
- **Role-Based Access Control**: USER and ADMIN roles with different permissions
- **Admin Analytics**: Dashboard statistics, user analytics, and task analytics for administrators
- **User Management**: Admin can manage users (create, update roles, delete, bulk operations)
- **RESTful API**: Following REST principles with proper HTTP status codes
- **API Versioning**: Versioned endpoints (`/api/v1/`) for backward compatibility
- **Input Validation**: Joi-based request validation
- **Error Handling**: Centralized error handling with detailed messages
- **API Documentation**: Swagger/OpenAPI documentation at `/api-docs`
- **Security**: Helmet, CORS, rate limiting, secure JWT handling
- **Logging**: Winston-based logging system
- **Repository Pattern**: Clean architecture with separation of concerns
- **Database Abstraction**: Repository pattern with adapter pattern for multiple databases

### Frontend
- **User Authentication**: Login and registration with JWT token handling
- **Protected Routes**: Dashboard accessible only to authenticated users
- **Task Management**: Full CRUD operations for tasks
- **Role-Based UI**: Admin users can view all tasks, regular users see only their tasks
- **Responsive Design**: Clean, modern UI with gradient background
- **Error Handling**: User-friendly error messages
- **Auto-logout**: Automatic redirect to login on token expiration

## 📁 Project Structure

```
node-assignments/
├── backend/                 # Node.js/Express API
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes (versioned)
│   │   ├── services/       # Business logic layer
│   │   ├── server.js       # Express server
│   │   └── swagger.js      # Swagger configuration
│   ├── logs/               # Application logs
│   └── package.json
└── frontend/               # React frontend
    ├── src/
    │   ├── components/     # React components
    │   ├── context/        # React context (Auth)
    │   ├── pages/          # Page components
    │   ├── utils/          # API client
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # React entry point
    └── package.json
```

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL, MySQL, or MongoDB (configurable)
- **ORM/Drivers**: Prisma (for PostgreSQL/MySQL), MongoDB Driver (for MongoDB)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: Custom CSS

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ OR MySQL 8+ OR MongoDB 4.4+
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd node-assignments
```

### 2. Set Up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your configuration. Choose your database type:

#### Option 1: PostgreSQL (Default)
```env
DB_TYPE=postgres
POSTGRES_URL=postgresql://username:password@localhost:5432/task_management
```

#### Option 2: MySQL
```env
DB_TYPE=mysql
MYSQL_URL=mysql://username:password@localhost:3307/task_management
```

#### Option 3: MongoDB
```env
DB_TYPE=mongodb
MONGODB_URL=mongodb://localhost:27017/task_management
```

Common configuration (required for all databases):
```env
PORT=8000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Set up your chosen database and run migrations (PostgreSQL/MySQL only):
```bash
# For PostgreSQL or MySQL only
npm run prisma:migrate
npm run prisma:generate
# For MongoDB, no migrations needed
```

Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/api-docs`

### 3. Set Up the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

Start the frontend development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/api-docs` for interactive Swagger documentation.

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile (protected)

#### Tasks
- `POST /api/v1/tasks` - Create a task (protected)
- `GET /api/v1/tasks/my` - Get current user's tasks (protected)
- `GET /api/v1/tasks/all` - Get all tasks (Admin only)
- `GET /api/v1/tasks/:id` - Get a specific task (protected)
- `PUT /api/v1/tasks/:id` - Update a task (protected)
- `DELETE /api/v1/tasks/:id` - Delete a task (protected)

#### Admin Analytics (Admin Only)
- `GET /api/v1/admin/analytics/dashboard` - Get dashboard statistics
- `GET /api/v1/admin/analytics/users` - Get user statistics
- `GET /api/v1/admin/analytics/tasks` - Get task statistics

#### Admin User Management (Admin Only)
- `GET /api/v1/admin/users` - Get all users with pagination
- `GET /api/v1/admin/users/:id` - Get user by ID
- `POST /api/v1/admin/users` - Create a new user
- `PUT /api/v1/admin/users/:id/role` - Update user role
- `DELETE /api/v1/admin/users/:id` - Delete a user
- `POST /api/v1/admin/users/bulk/role` - Bulk update user roles
- `POST /api/v1/admin/users/bulk/delete` - Bulk delete users

## 🔐 Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt (10 salt rounds)
2. **JWT Authentication**: Secure token-based authentication with expiration
3. **Role-Based Access Control**: Different permissions for USER and ADMIN roles
4. **Rate Limiting**: Protection against brute force attacks (100 requests/15min)
5. **Helmet**: Security headers for Express
6. **CORS**: Configured cross-origin resource sharing
7. **Input Validation**: All inputs validated using Joi schemas
8. **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🏗 Architecture

### Repository Pattern
The backend follows the Repository Pattern for clean separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle data access with database-specific implementations
- **Middleware**: Cross-cutting concerns (auth, validation, error handling)

### Multi-Database Architecture
The backend supports multiple database backends through the Repository Pattern and Adapter Pattern:

- **Database Manager**: Handles connection to different database types
- **Repository Factory**: Returns the appropriate repository implementation based on `DB_TYPE`
- **Base Repository Interface**: Defines the contract all repositories must implement
- **Database-Specific Repositories**: 
  - `PostgresRepository`: Uses Prisma ORM
  - `MySQLRepository`: Uses MySQL2 driver with raw SQL
  - `MongoDBRepository`: Uses MongoDB native driver

To switch databases, simply change the `DB_TYPE` environment variable and restart the server.

This architecture makes the codebase:
- **Testable**: Easy to unit test each layer
- **Maintainable**: Clear separation of responsibilities
- **Scalable**: Easy to add new features or swap implementations

### API Versioning
The API uses versioning (`/api/v1/`) to ensure backward compatibility when making breaking changes. Future versions can be added as `/api/v2/`, etc.

## 📈 Scalability Considerations

This application is designed with scalability in mind:

### Current Scalability Features
1. **Stateless Design**: JWT authentication enables horizontal scaling
2. **Database Indexing**: Proper indexes on frequently queried fields
3. **Modular Structure**: Easy to extract services into microservices
4. **Environment Configuration**: Easy deployment across environments
5. **API Versioning**: Supports multiple API versions simultaneously

### Future Scalability Enhancements

#### Caching Layer
- **Redis**: Cache frequently accessed data (user sessions, task lists)
- **CDN**: Serve static assets through CDN (Cloudflare, AWS CloudFront)
- **Application Caching**: Implement in-memory caching for API responses

#### Load Balancing
- **Nginx**: Reverse proxy and load balancer
- **AWS ALB**: Application Load Balancer for AWS deployments
- **Kubernetes**: Container orchestration for auto-scaling

#### Microservices Architecture
- Extract authentication service
- Separate task management service
- Independent database per service
- Event-driven communication with message queues (RabbitMQ, Kafka)

#### Database Scaling
- **Read Replicas**: Offload read queries to replicas
- **Connection Pooling**: Efficient database connection management
- **Sharding**: Split database across multiple servers for high volume

#### Monitoring & Observability
- **Prometheus + Grafana**: Metrics and monitoring
- **ELK Stack**: Centralized logging (Elasticsearch, Logstash, Kibana)
- **APM Tools**: Application Performance Monitoring (New Relic, Datadog)

#### Deployment Options
- **Docker**: Containerize applications
- **Kubernetes**: Orchestrate containers with auto-scaling
- **Serverless**: AWS Lambda, Azure Functions for specific functions
- **API Gateway**: Kong, AWS API Gateway for routing and rate limiting

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Deployment

### Docker Deployment

The docker-compose.yml file includes PostgreSQL by default. To use a different database:

**For PostgreSQL (Default):**
```bash
docker-compose up -d
```

**For MySQL or MongoDB:**
Modify the `docker-compose.yml` file to replace the PostgreSQL service with your preferred database, then run:
```bash
docker-compose up -d
```

See the backend README.md for detailed multi-database configuration instructions.

### Manual Deployment

1. Set environment variables for production
2. Build the frontend: `cd frontend && npm run build`
3. Start the backend: `cd backend && npm start` (runs on port 8000)
4. Serve the frontend static files with Nginx

See individual README files in `backend/` and `frontend/` for detailed deployment instructions.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

ISC

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Built with modern best practices for security and scalability
- Following REST API design principles
- Repository Pattern for clean architecture

## 📞 Support

For issues and questions, please open an issue on GitHub.
"# task-management-system" 
