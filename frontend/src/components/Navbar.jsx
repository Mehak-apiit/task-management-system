import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Task Management</div>
      <button 
        className="mobile-menu-toggle" 
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <div className={`navbar-links ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        {user ? (
          <>
            <Link to="/dashboard" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            {user.role === 'ADMIN' && (
              <>
                <Link to="/admin/dashboard" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
                <Link to="/admin/users" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>User Management</Link>
                <Link to="/admin/analytics" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Analytics</Link>
              </>
            )}
            <span className="navbar-link">Welcome, {user.email}</span>
            <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link to="/register" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
