import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { kanjiApi } from '../services/api';
import axios from 'axios';

function KanjiForm() {
  // Get the id parameter from the URL (if editing)
  const { id } = useParams();
  const navigate = useNavigate();

  // State for form fields
  const [formData, setFormData] = useState({
    kanji: '',
    onyomi: '',
    kunyomi: '',
    meaning: ''
  });

  // State for suggestion
  const [suggestion, setSuggestion] = useState(null);

  // State for form submission and loading
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch a random grade 1 kanji from external API
  const fetchRandomKanjiSuggestion = async () => {
    try {
      // Fetch grade 1 kanji list
      const gradeResponse = await axios.get('https://kanjiapi.dev/v1/kanji/grade-1');
      const gradeKanji = gradeResponse.data;
      
      // Select a random kanji
      const randomKanji = gradeKanji[Math.floor(Math.random() * gradeKanji.length)];
      
      // Fetch detailed info for the random kanji
      const detailResponse = await axios.get(`https://kanjiapi.dev/v1/kanji/${randomKanji}`);
      const kanjiDetails = detailResponse.data;
      
      // Only suggest if all required fields are present
      if (
        kanjiDetails.kanji && 
        kanjiDetails.meanings && kanjiDetails.meanings.length > 0 &&
        kanjiDetails.kun_readings && kanjiDetails.kun_readings.length > 0 &&
        kanjiDetails.on_readings && kanjiDetails.on_readings.length > 0
      ) {
        setSuggestion({
          kanji: kanjiDetails.kanji,
          meaning: kanjiDetails.meanings[0],
          kunyomi: kanjiDetails.kun_readings[0],
          onyomi: kanjiDetails.on_readings[0]
        });
      } else {
        setSuggestion(null);
      }
    } catch (err) {
      console.error('Error fetching kanji suggestion:', err);
      setSuggestion(null);
    }
  };

  // Use suggestion to populate form
  const useSuggestion = () => {
    if (suggestion) {
      setFormData({
        kanji: suggestion.kanji,
        meaning: suggestion.meaning,
        kunyomi: suggestion.kunyomi,
        onyomi: suggestion.onyomi
      });
    }
  };

  // If we have an ID, fetch the kanji data when component mounts
  useEffect(() => {
    if (id) {
      setLoading(true);
      kanjiApi.getKanjiById(id)
        .then(data => {
          setFormData({
            kanji: data.kanji || '',
            onyomi: data.onyomi || '',
            kunyomi: data.kunyomi || '',
            meaning: data.meaning || ''
          });
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch kanji data');
          setLoading(false);
        });
    } else {
      // Fetch a suggestion when creating a new kanji
      fetchRandomKanjiSuggestion();
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.kanji || !formData.meaning || !formData.onyomi || !formData.kunyomi) {
        throw new Error('All fields are required');
      }

      // Transform data to match backend expectations
      const backendFormData = {
        Kanji: formData.kanji,
        Meaning: formData.meaning,
        Onyomi: formData.onyomi,
        Kunyomi: formData.kunyomi
      };

      let createdKanji;
      if (id) {
        // Update existing kanji
        createdKanji = await kanjiApi.updateKanji(id, backendFormData);
        console.log('Updated Kanji:', createdKanji);
      } else {
        // Create new kanji
        createdKanji = await kanjiApi.createKanji(backendFormData);
        console.log('Created Kanji:', createdKanji);
      }
      
      // Navigate back to list after successful submission
      // Pass the newly created/updated kanji as navigation state
      console.log('Navigating with state:', {
        newKanji: {
          ...createdKanji,
          _id: createdKanji._id || id  // Use existing ID or newly created ID
        }
      });
      console.log('Navigation state details:');
      console.log('  - newKanji:', {
        ...createdKanji,
        _id: createdKanji._id || id
      });
      console.log('  - navigate function:', navigate);
      console.log('  - navigate arguments:', '/list', {
        state: { 
          newKanji: {
            ...createdKanji,
            _id: createdKanji._id || id
          }
        } 
      });
      
      navigate('/list', { 
        state: { 
          newKanji: {
            ...createdKanji,
            _id: createdKanji._id || id  // Use existing ID or newly created ID
          }
        } 
      });
    } catch (err) {
      console.error('Full error details:', err);
      
      // More specific error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server Error: ${err.response.data.message || 'Failed to save kanji'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || 'Failed to save kanji');
      }
      
      setSubmitting(false);
    }
  };

  // Render loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="kanji-form-container">
      <h1>{id ? 'Edit Kanji' : 'Add New Kanji'}</h1>
      
      {/* Suggestion section - only for new kanji */}
      {!id && suggestion && (
        <div className="kanji-suggestion-card">
          <h3>Kanji Suggestion</h3>
          <div className="kanji-suggestion-details">
            <p>
              <span className="suggestion-label">Kanji</span>
              <span className="suggestion-value">{suggestion.kanji}</span>
            </p>
            <p>
              <span className="suggestion-label">Meaning</span>
              <span className="suggestion-value">{suggestion.meaning}</span>
            </p>
            <p>
              <span className="suggestion-label">Kunyomi</span>
              <span className="suggestion-value">{suggestion.kunyomi}</span>
            </p>
            <p>
              <span className="suggestion-label">Onyomi</span>
              <span className="suggestion-value">{suggestion.onyomi}</span>
            </p>
          </div>
          <div className="kanji-suggestion-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={useSuggestion}
            >
              Use Suggestion
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={fetchRandomKanjiSuggestion}
            >
              Get New Suggestion
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="kanji">Kanji Character*</label>
          <input
            type="text"
            id="kanji"
            name="kanji"
            value={formData.kanji}
            onChange={handleChange}
            className="form-input"
            required
            placeholder="Enter kanji character"
          />
        </div>

        <div className="form-group">
          <label htmlFor="onyomi">Onyomi Reading</label>
          <input
            type="text"
            id="onyomi"
            name="onyomi"
            value={formData.onyomi}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter onyomi reading"
          />
        </div>

        <div className="form-group">
          <label htmlFor="kunyomi">Kunyomi Reading</label>
          <input
            type="text"
            id="kunyomi"
            name="kunyomi"
            value={formData.kunyomi}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter kunyomi reading"
          />
        </div>

        <div className="form-group">
          <label htmlFor="meaning">Meaning</label>
          <input
            type="text"
            id="meaning"
            name="meaning"
            value={formData.meaning}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter meaning"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting}
          >
            {submitting ? (id ? 'Saving...' : 'Adding...') : (id ? 'Save Changes' : 'Add Kanji')}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default KanjiForm;
