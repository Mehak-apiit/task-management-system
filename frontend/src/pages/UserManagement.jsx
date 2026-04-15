import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(null);

  const limit = 50;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const response = await adminAPI.getAllUsers(params);
      // Handle different response structures - the actual structure is { success, message, data: [...], pagination: {...} }
      const usersData = response?.data?.data || [];
      const paginationData = response?.data?.pagination || { total: 0 };
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotal(paginationData.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(id);
        fetchUsers();
        toast.success('User deleted successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
        toast.error(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleUpdateRole = async (id, newRole) => {
    try {
      await adminAPI.updateUserRole(id, newRole);
      fetchUsers();
      toast.success('User role updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await adminAPI.createUser(userData);
      setShowCreateModal(false);
      fetchUsers();
      toast.success('User created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleViewTasks = async (userId) => {
    setSelectedUser(userId);
    setShowTasksModal(userId);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Create User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="user-search" className="label">Search</label>
          <input
            id="user-search"
            name="search"
            type="text"
            className="input"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="user-role-filter" className="label">Role Filter</label>
          <select
            id="user-role-filter"
            name="roleFilter"
            className="input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading users...</div>
      ) : (
        <>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tasks</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>
                        <select
                          id={`user-role-${user.id}`}
                          name={`user-role-${user.id}`}
                          className="input"
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          disabled={user.id === currentUser?.id}
                          style={{ padding: '4px 8px', fontSize: '14px' }}
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td>{user._count?.tasks || 0}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }}
                          onClick={() => handleViewTasks(user.id)}
                        >
                          View Tasks
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.id === currentUser?.id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card modal" style={{ maxWidth: '400px', width: '100%', margin: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Create New User</h3>
            <CreateUserForm onSubmit={handleCreateUser} onCancel={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}

      {/* View Tasks Modal */}
      {showTasksModal && (
        <UserTasksModal userId={showTasksModal} onClose={() => setShowTasksModal(null)} />
      )}
    </div>
  );
};

const CreateUserForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'USER' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="create-user-email" className="label">Email</label>
        <input
          id="create-user-email"
          name="email"
          type="email"
          className="input"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="create-user-password" className="label">Password</label>
        <input
          id="create-user-password"
          name="password"
          type="password"
          className="input"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
      </div>
      <div>
        <label htmlFor="create-user-role" className="label">Role</label>
        <select
          id="create-user-role"
          name="role"
          className="input"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="submit" className="btn btn-primary">Create</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

const UserTasksModal = ({ userId, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await adminAPI.getUserTasks(userId, { page: 1, limit: 10 });
        // Handle different response structures - based on pattern: { success, message, data: [...], pagination: {...} }
        const tasksData = response?.data?.data || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (err) {
        toast.error('Failed to fetch user tasks');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [userId]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card modal" style={{ maxWidth: '800px', width: '100%', margin: '20px', maxHeight: '80vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>User Tasks</h3>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No tasks found</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>
                      <span className={`badge badge-${task.status}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
