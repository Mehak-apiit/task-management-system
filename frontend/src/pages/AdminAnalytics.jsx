import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [userRes, taskRes] = await Promise.all([
        adminAPI.getUserStats(params),
        adminAPI.getTaskStats(params)
      ]);

      // Handle different response structures
      setUserStats(userRes?.data?.data || userRes?.data || null);
      setTaskStats(taskRes?.data?.data || taskRes?.data || null);
      toast.success('Analytics refreshed successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      toast.error(err.response?.data?.message || 'Failed to fetch analytics');
      setUserStats(null);
      setTaskStats(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <div className="container"><div style={{ textAlign: 'center', padding: '40px' }}>Loading analytics...</div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Admin Analytics</h1>
        <button className="btn btn-primary" onClick={fetchAnalytics}>Refresh</button>
      </div>

      {/* Date Filter */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="analytics-start-date" className="label">Start Date</label>
          <input
            id="analytics-start-date"
            name="startDate"
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="analytics-end-date" className="label">End Date</label>
          <input
            id="analytics-end-date"
            name="endDate"
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
          <button className="btn btn-secondary" onClick={() => { setStartDate(''); setEndDate(''); }}>
            Clear Filters
          </button>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

      <div className="card-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* User Statistics */}
        {userStats && (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>User Statistics</h3>
            <div className="card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Total Users</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{userStats.totalUsers || 0}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Active Users</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{userStats.activeUsers || 0}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>New Users (30d)</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{userStats.newUsers || 0}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Users with Tasks</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{userStats.usersWithTasks || 0}</p>
              </div>
            </div>
            {userStats?.userGrowth && Array.isArray(userStats.userGrowth) && userStats.userGrowth.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>User Growth</p>
                <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                  {userStats.userGrowth.map((item, index) => (
                    <div key={index} style={{ fontSize: '12px', padding: '4px 0' }}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Statistics */}
        {taskStats && (
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Task Statistics</h3>
            <div className="card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Total Tasks</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{taskStats.totalTasks || 0}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Completed</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{taskStats.completedTasks || 0}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Completion Rate</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{taskStats.completionRate || 0}%</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>Avg Tasks/User</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{taskStats.avgTasksPerUser || 0}</p>
              </div>
            </div>
            {taskStats?.tasksByStatus && Array.isArray(taskStats.tasksByStatus) && taskStats.tasksByStatus.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Tasks by Status</p>
                {taskStats.tasksByStatus.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '14px' }}>
                    <span>{item?.status ? item.status.replace('_', ' ') : 'Unknown'}</span>
                    <span style={{ fontWeight: 'bold' }}>{item?._count?.status || item?.count || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
