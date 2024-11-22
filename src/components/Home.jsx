import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import KanjiGallery from './KanjiGallery';

function Home() {
  const characters = [
    '漢', '字', 'あ', 'い', 'う', 'え', 'お',
    'カ', 'キ', 'ク', 'ケ', 'コ', '学', '習'
  ];

  const [fallingChars, setFallingChars] = useState([]);

  useEffect(() => {
    const generateFallingCharacters = () => {
      const newChars = Array.from({ length: 9 }, (_, index) => ({
        id: index,
        char: characters[Math.floor(Math.random() * characters.length)],
      }));
      setFallingChars(newChars);
    };

    generateFallingCharacters();
    const interval = setInterval(generateFallingCharacters, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* Hero section */}
      <div className="hero-section">
        <div className="falling-characters">
          {fallingChars.map((char) => (
            <span key={char.id} className="falling-character">
              {char.char}
            </span>
          ))}
        </div>
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
