import { Link } from 'react-router-dom';

// Navigation bar component for consistent header across pages
function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-content">
        {/* Logo/Home link */}
        <Link to="/" className="nav-logo">
          漢字 Learn
        </Link>
        
        {/* Navigation links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/add" className="nav-link">Add Kanji</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
