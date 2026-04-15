const TaskList = ({ tasks, onEdit, onDelete, isAdmin }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#6b7280' }}>No tasks found. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            {isAdmin && <th>User</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task?.title || 'Unknown'}</td>
              <td>{task?.description || '-'}</td>
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
              {isAdmin && <td>{task?.user?.email || '-'}</td>}
              <td>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }}
                  onClick={() => onEdit(task)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
