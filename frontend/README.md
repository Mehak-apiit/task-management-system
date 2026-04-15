# Task Management Frontend

React frontend for the Task Management API with authentication and task management features.

## Features

- **User Authentication**: Login and registration with JWT token handling
- **Protected Routes**: Dashboard accessible only to authenticated users
- **Task Management**: Create, read, update, and delete tasks
- **Role-Based Access**: Admin users can view all tasks, regular users see only their tasks
- **Admin Dashboard**: Overview statistics, users by role, tasks by status/priority, recent users/tasks
- **Admin Analytics**: Detailed user and task statistics with date filtering
- **User Management**: Admin can create, update roles, delete users, view user tasks with pagination
- **Responsive Design**: Clean, modern UI with gradient background
- **Error Handling**: User-friendly error messages
- **Auto-logout**: Automatic redirect to login on token expiration

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: CSS (custom styles)
- **Notifications**: react-hot-toast

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation bar with user info
│   │   ├── TaskForm.jsx       # Task creation/editing form
│   │   └── TaskList.jsx       # Task display table
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context and state
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Dashboard.jsx      # Main dashboard with task management
│   │   ├── AdminDashboard.jsx # Admin overview with statistics
│   │   ├── AdminAnalytics.jsx # Admin analytics with date filtering
│   │   └── UserManagement.jsx # Admin user management with CRUD
│   ├── utils/
│   │   └── api.js             # API client with interceptors
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation

1. **Navigate to the frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000/api
```

## Running the Application

**Development mode:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Production build:**
```bash
npm run build
npm run preview
```

## Usage

### 1. Register a New User
- Navigate to `/register`
- Enter email, password, and select role (USER or ADMIN)
- Click "Register"

### 2. Login
- Navigate to `/login`
- Enter your email and password
- Click "Login"

### 3. Dashboard (Protected Route)
- After login, you'll be redirected to the dashboard
- View your tasks (or all tasks if you're an admin)
- Click "+ New Task" to create a task
- Click "Edit" to modify a task
- Click "Delete" to remove a task

### 4. Admin Features (Admin Only)
Admin users have access to additional features:

**Admin Dashboard** (`/admin/dashboard`):
- Overview statistics (total users, tasks, active users, completion rate)
- Users by role breakdown
- Tasks by status and priority
- Recent users and tasks

**Admin Analytics** (`/admin/analytics`):
- Detailed user statistics (total, active, new users, users with tasks)
- Detailed task statistics (total, completed, completion rate, avg tasks per user)
- Date range filtering for analytics
- User growth tracking

**User Management** (`/admin/users`):
- View all users with pagination
- Search users by email
- Filter users by role
- Create new users
- Update user roles
- Delete users
- View tasks for specific users

### 5. Logout
- Click the "Logout" button in the navigation bar

## API Integration

The frontend uses Axios for API calls with automatic token injection:

- **Authentication**: Tokens are stored in localStorage and added to request headers
- **Error Handling**: Automatic redirect to login on 401 errors
- **Request Interceptor**: Adds JWT token to all authenticated requests
- **Response Interceptor**: Handles token expiration and unauthorized access

## Features Breakdown

### Authentication Context
- Manages user state across the application
- Provides login, register, and logout functions
- Persists user session using localStorage

### Protected Routes
- Routes that require authentication
- Automatic redirect to login if not authenticated
- Prevents unauthorized access

### Task Management
- **Create**: Add new tasks with title, description, status, and priority
- **Read**: View tasks in a table format
- **Update**: Edit existing task details
- **Delete**: Remove tasks with confirmation

### Role-Based Access
- **USER**: Can only view and manage their own tasks
- **ADMIN**: Can view and manage all tasks across all users, plus access admin dashboard, analytics, and user management

## Styling

The application uses custom CSS with:
- Modern gradient background
- Card-based layout
- Responsive design
- Color-coded badges for status and priority
- Smooth transitions and hover effects

## Error Handling

- Form validation on submission
- API error messages displayed to users
- Automatic redirect on authentication failure
- Loading states during async operations

## Browser Support

Works on all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The API proxy is configured in `vite.config.js` for development
- Make sure the backend API is running on port 8000
- JWT tokens are stored in localStorage (consider using httpOnly cookies for production)

## Future Enhancements

- Add task filtering and search in regular dashboard
- Implement pagination for regular task lists
- Add drag-and-drop for task status
- Include task due dates
- Add task categories/tags
- Implement real-time updates with WebSocket
- Add unit and integration tests
- PWA support for offline access
- Add bulk operations for tasks
- Export analytics data
