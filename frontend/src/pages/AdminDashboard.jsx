import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      // Handle different response structures
      const statsData = response?.data?.data || response?.data || {};
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
      toast.error(err.response?.data?.message || 'Failed to fetch dashboard stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="container"><div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div></div>;
  }

  if (error) {
    return <div className="container"><div className="error">{error}</div></div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>Admin Dashboard</h1>
      
      {stats && (
        <div className="card-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {/* Overview Stats */}
          {stats.overview && (
            <>
              <div className="card">
                <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Users</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.overview.totalUsers || 0}</p>
              </div>
              <div className="card">
                <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Tasks</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.overview.totalTasks || 0}</p>
              </div>
              <div className="card">
                <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Active Users</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.overview.activeUsers || 0}</p>
              </div>
              <div className="card">
                <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Task Completion</h3>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.overview.totalTasks ? Math.round((stats.overview.completedTasks / stats.overview.totalTasks) * 100) : 0}%</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Users by Role */}
      {stats?.usersByRole && Array.isArray(stats.usersByRole) && stats.usersByRole.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Users by Role</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.usersByRole.map((item, index) => (
                  <tr key={index}>
                    <td>{item?.role || 'Unknown'}</td>
                    <td>{item?.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tasks by Status */}
      {stats?.tasksByStatus && Array.isArray(stats.tasksByStatus) && stats.tasksByStatus.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Tasks by Status</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasksByStatus.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`badge badge-${item?.status || 'pending'}`}>
                        {item?.status ? item.status.replace('_', ' ') : 'Unknown'}
                      </span>
                    </td>
                    <td>{item?.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tasks by Priority */}
      {stats?.tasksByPriority && Array.isArray(stats.tasksByPriority) && stats.tasksByPriority.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Tasks by Priority</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.tasksByPriority.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`badge badge-${item?.priority || 'medium'}`}>
                        {item?.priority || 'Unknown'}
                      </span>
                    </td>
                    <td>{item?.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Users */}
      {stats?.recentUsers && Array.isArray(stats.recentUsers) && stats.recentUsers.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Recent Users</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tasks</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user, index) => (
                  <tr key={index}>
                    <td>{user?.email || 'Unknown'}</td>
                    <td>{user?.role || 'Unknown'}</td>
                    <td>{user?._count?.tasks || 0}</td>
                    <td>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      {stats?.recentTasks && Array.isArray(stats.recentTasks) && stats.recentTasks.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Recent Tasks</h3>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>User</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map((task, index) => (
                  <tr key={index}>
                    <td>{task?.title || 'Unknown'}</td>
                    <td>
                      <span className={`badge badge-${task?.status || 'pending'}`}>
                        {task?.status ? task.status.replace('_', ' ') : 'Unknown'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${task?.priority || 'medium'}`}>
                        {task?.priority || 'Unknown'}
                      </span>
                    </td>
                    <td>{task?.user?.email || '-'}</td>
                    <td>{task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unknown'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
