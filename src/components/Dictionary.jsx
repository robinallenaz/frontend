import { useState } from 'react';
import '../styles/Dictionary.css';

function Dictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchKanji = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Remove any non-kanji characters and get the first character
      const kanji = searchTerm.trim().charAt(0);
      const response = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Kanji not found' : 'Network error');
      }
      
      const data = await response.json();
      setResults({
        kanji: data.kanji,
        meanings: data.meanings,
        kunReadings: data.kun_readings,
        onReadings: data.on_readings,
        grade: data.grade,
        strokeCount: data.stroke_count
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message === 'Kanji not found' 
        ? 'Please enter a valid kanji character' 
        : 'Failed to fetch results. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="dictionary-container">
      <h1>Kanji Dictionary</h1>
      <p className="info-text">Enter a single kanji character to see its details</p>
      
      <form onSubmit={searchKanji} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a kanji character"
          className="search-input"
          maxLength={1}
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Searching...</div>}

      {results && (
        <div className="result-card">
          <h2 className="kanji-character">{results.kanji}</h2>
          <div className="kanji-details">
            <div className="detail-section">
              <h3>Meanings</h3>
              <p>{results.meanings.join(', ')}</p>
            </div>
            
            <div className="detail-section">
              <h3>On Readings</h3>
              <p>{results.onReadings.length > 0 ? results.onReadings.join(', ') : 'None'}</p>
            </div>
            
            <div className="detail-section">
              <h3>Kun Readings</h3>
              <p>{results.kunReadings.length > 0 ? results.kunReadings.join(', ') : 'None'}</p>
            </div>

            <div className="detail-section metadata">
              <p><strong>Grade:</strong> {results.grade || 'N/A'}</p>
              <p><strong>Stroke Count:</strong> {results.strokeCount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dictionary;
