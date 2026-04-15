import { useState, useEffect } from 'react';

const TaskForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        status: initialData.status,
        priority: initialData.priority,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px' }}>{initialData ? 'Edit Task' : 'Create New Task'}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="task-title" className="label">Title *</label>
          <input
            id="task-title"
            name="title"
            type="text"
            className="input"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="task-description" className="label">Description</label>
          <textarea
            id="task-description"
            name="description"
            className="input"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        <div className="form-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="task-status" className="label">Status</label>
            <select id="task-status" name="status" className="input" value={formData.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="task-priority" className="label">Priority</label>
            <select id="task-priority" name="priority" className="input" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update' : 'Create'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
