import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { kanjiApi } from '../services/api';

function KanjiList() {
  // State to store our list of kanji and loading/error states
  const [kanjiList, setKanjiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch kanji data from our API
  const fetchKanji = async () => {
    try {
      const data = await kanjiApi.getAllKanji();
      setKanjiList(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch kanji list');
      setLoading(false);
    }
  };

  // Function to handle kanji deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this kanji?')) {
      try {
        await kanjiApi.deleteKanji(id);
        // Remove the deleted kanji from our list
        setKanjiList(kanjiList.filter(kanji => kanji._id !== id));
      } catch (err) {
        setError('Failed to delete kanji');
      }
    }
  };

  // Use useEffect to fetch data when component mounts
  useEffect(() => {
    fetchKanji();
  }, []); // Empty dependency array means this runs once on mount

  // Show loading state
  if (loading) {
    return <div className="loading">Loading kanji...</div>;
  }

  // Show error state
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {/* Header section with title and add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Kanji List</h1>
        <Link to="/add" className="btn btn-primary">Add New Kanji</Link>
      </div>

      {/* Grid of kanji cards */}
      <div className="kanji-grid">
        {kanjiList.map((kanji) => (
          <div key={kanji._id} className="kanji-card">
            {/* Main kanji character */}
            <div className="kanji-character">{kanji.kanji}</div>
            
            {/* Kanji details */}
            <div className="kanji-details">
              <p><strong>Onyomi:</strong> {kanji.onyomi || 'N/A'}</p>
              <p><strong>Kunyomi:</strong> {kanji.kunyomi || 'N/A'}</p>
              <p><strong>Meaning:</strong> {kanji.meaning || 'N/A'}</p>
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <Link 
                to={`/edit/${kanji._id}`} 
                className="btn btn-primary"
              >
                Edit
              </Link>
              <button 
                onClick={() => handleDelete(kanji._id)}
                className="btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Show message if no kanji found */}
      {kanjiList.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          No kanji found. Click "Add New Kanji" to add some!
        </p>
      )}
    </div>
  );
}

export default KanjiList;
