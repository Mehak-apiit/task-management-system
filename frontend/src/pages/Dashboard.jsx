import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI } from '../utils/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = user?.role === 'ADMIN' 
        ? await taskAPI.getAllTasks()
        : await taskAPI.getMyTasks();
      
      // Handle different response structures
      const tasksData = response?.data?.data || response?.data?.tasks || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (taskData) => {
    try {
      await taskAPI.createTask(taskData);
      setShowForm(false);
      fetchTasks();
      toast.success('Task created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await taskAPI.updateTask(id, taskData);
      setEditingTask(null);
      fetchTasks();
      toast.success('Task updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.deleteTask(id);
        fetchTasks();
        toast.success('Task deleted successfully!');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete task');
        toast.error(err.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>
          {user?.role === 'ADMIN' ? 'All Tasks' : 'My Tasks'}
          <span style={{ fontSize: '14px', color: '#ffffff', marginLeft: '12px', fontWeight: '500' }}>
            ({tasks?.length || 0} tasks)
          </span>
        </h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <TaskForm
          onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          initialData={editingTask}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</div>
      ) : (
        <div className="table-wrapper">
          <TaskList
            tasks={tasks}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isAdmin={user?.role === 'ADMIN'}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
