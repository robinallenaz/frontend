import { Link, useLocation } from 'react-router-dom';

// Navigation bar component for consistent header across pages
function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        {/* Logo/Home link */}
        <Link to="/" className="nav-brand">
          漢字 Learn
        </Link>

        {/* Navigation links */}
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>
            Home
          </Link>
          <Link to="/list" className={isActive('/list')}>
            Collection
          </Link>
          <Link to="/practice" className={isActive('/practice')}>
            Practice
          </Link>
          <Link to="/dictionary" className={isActive('/dictionary')}>
            Dictionary
          </Link>
          <Link to="/about" className={isActive('/about')}>
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
