import { Link } from 'react-router-dom';
import KanjiGallery from './KanjiGallery';

function Home() {
  return (
    <div className="home-container">
      {/* Hero section */}
      <div className="hero-section">
        <h1>Kanji Learning Journey</h1>
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
        <KanjiGallery />
      </div>
    </div>
  );
}

export default Home;
