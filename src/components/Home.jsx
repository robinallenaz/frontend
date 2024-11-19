import { Link } from 'react-router-dom';
import KanjiGallery from './KanjiGallery';

function Home() {
  return (
    <div className="home-container">
      {/* Hero section */}
      <div className="hero-section">
        <h1>Kanji Learning Journey</h1>
        <p>Explore and master Japanese characters through interactive learning</p>
        <div className="hero-buttons">
          <Link to="/add" className="btn btn-primary">
            Add Custom Kanji
          </Link>
          <Link to="/list" className="btn btn-secondary">
            View My Collection
          </Link>
        </div>
      </div>

      {/* Gallery section */}
      <div className="gallery-section">
        <h2>Explore Kanji</h2>
        <p>Click on any card to reveal meanings and readings</p>
        <KanjiGallery />
      </div>
    </div>
  );
}

export default Home;
