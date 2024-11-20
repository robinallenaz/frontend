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
      setLoading(true);
      setError(null);
      
      const data = await kanjiApi.getAllKanji();
      
      // Validate data
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Ensure data is an array
      const kanjiArray = Array.isArray(data) ? data : [data];
      
      // Sort by most recently added using createdAt timestamp
      const sortedData = kanjiArray.sort((a, b) => {
        // Fallback to _id if createdAt is not available
        const dateA = new Date(a.createdAt || a._id);
        const dateB = new Date(b.createdAt || b._id);
        return dateB - dateA;
      });
      
      setKanjiList(sortedData);
      setLoading(false);
    } catch (err) {
      // More detailed error handling
      console.error('Full error details:', err);
      
      // Specific error messages based on error type
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server Error: ${err.response.data?.message || 'Failed to fetch kanji list'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || 'Failed to fetch kanji list');
      }
      
      setLoading(false);
    }
  };

  // Function to handle kanji deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this kanji?')) {
      try {
        await kanjiApi.deleteKanji(id);
        setKanjiList(kanjiList.filter(kanji => kanji._id !== id));
      } catch (err) {
        setError('Failed to delete kanji');
      }
    }
  };

  useEffect(() => {
    fetchKanji();
  }, []);

  if (loading) return <div className="loading">Loading kanji...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="kanji-list-container">
      {/* Hero section */}
      <div className="hero-section">
        <h1>Kanji Collection</h1>
        <p>Explore and manage your kanji learning journey</p>
        <Link to="/add" className="btn btn-primary add-kanji-btn">
          Add New Kanji
        </Link>
      </div>

      {/* Grid of kanji cards */}
      <div className="kanji-grid">
        {kanjiList.map((kanji) => (
          <div key={kanji._id} className="kanji-card">
            <div className="kanji-card-content">
              {/* Main kanji character */}
              <div className="kanji-character">{kanji.kanji}</div>
              
              {/* Kanji details */}
              <div className="kanji-details">
                <p><strong>Onyomi:</strong> {kanji.onyomi || 'N/A'}</p>
                <p><strong>Kunyomi:</strong> {kanji.kunyomi || 'N/A'}</p>
                <p><strong>Meaning:</strong> {kanji.meaning || 'N/A'}</p>
              </div>

              {/* Action buttons */}
              <div className="kanji-actions">
                <Link to={`/edit/${kanji._id}`} className="btn btn-secondary">
                  Edit
                </Link>
                <button onClick={() => handleDelete(kanji._id)} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {kanjiList.length === 0 && (
        <div className="empty-state">
          <p>No kanji found. Start by adding some kanji to your collection!</p>
          <Link to="/add" className="btn btn-primary">
            Add Your First Kanji
          </Link>
        </div>
      )}
    </div>
  );
}

export default KanjiList;
