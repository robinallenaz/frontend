import { useState, useEffect } from 'react';
import axios from 'axios';

function KanjiGallery() {
  const [kanjiData, setKanjiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [kanjiDetails, setKanjiDetails] = useState({});
  const [flippedCards, setFlippedCards] = useState(new Set());

  // Fetch initial kanji list
  useEffect(() => {
    const fetchKanji = async () => {
      try {
        const response = await axios.get('https://kanjiapi.dev/v1/kanji/grade-1');
        setKanjiData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch kanji data');
        setLoading(false);
      }
    };

    fetchKanji();
  }, []);

  // Fetch details for a specific kanji
  const fetchKanjiDetails = async (kanji) => {
    if (kanjiDetails[kanji]) return; // Don't fetch if we already have the details

    try {
      const response = await axios.get(`https://kanjiapi.dev/v1/kanji/${kanji}`);
      setKanjiDetails(prev => ({
        ...prev,
        [kanji]: response.data
      }));
    } catch (err) {
      console.error('Failed to fetch kanji details:', err);
    }
  };

  // Handle card click
  const handleCardClick = async (kanji) => {
    if (!kanjiDetails[kanji]) {
      await fetchKanjiDetails(kanji);
    }
    
    setFlippedCards(prev => {
      const newFlipped = new Set(prev);
      if (newFlipped.has(kanji)) {
        newFlipped.delete(kanji);
      } else {
        newFlipped.add(kanji);
      }
      return newFlipped;
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading kanji...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="kanji-gallery-container">
      <div className="gallery-header">
        <h1>Kanji Gallery</h1>
        <p>Click on a kanji to see more details</p>
      </div>
      
      <div className="kanji-gallery-grid">
        {kanjiData.map((kanji, index) => (
          <div 
            key={index} 
            className={`kanji-gallery-card ${flippedCards.has(kanji) ? 'is-flipped' : ''}`}
            onClick={() => handleCardClick(kanji)}
          >
            <div className="kanji-card-inner">
              {/* Front of card */}
              <div className="kanji-card-front">
                <div className="kanji-gallery-character">{kanji}</div>
              </div>
              
              {/* Back of card */}
              <div className="kanji-card-back">
                {kanjiDetails[kanji] ? (
                  <div className="kanji-details-content">
                    <p className="kanji-meaning">
                      {kanjiDetails[kanji].meanings[0]}
                    </p>
                    <div className="kanji-readings">
                      <p className="reading-label">On:</p>
                      <p className="reading-text">
                        {kanjiDetails[kanji].on_readings.slice(0, 2).join(', ')}
                      </p>
                      <p className="reading-label">Kun:</p>
                      <p className="reading-text">
                        {kanjiDetails[kanji].kun_readings.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="loading">Loading...</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanjiGallery;
