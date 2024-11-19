import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { kanjiApi } from '../services/api';

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

  // State for form submission and loading
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

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
      // Validate required field
      if (!formData.kanji.trim()) {
        throw new Error('Kanji character is required');
      }

      // If we have an ID, update existing kanji, otherwise create new
      if (id) {
        await kanjiApi.updateKanji(id, formData);
      } else {
        await kanjiApi.createKanji(formData);
      }
      
      // Redirect back to the list page on success
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to save kanji');
      setSubmitting(false);
    }
  };

  // Show loading state while fetching kanji data
  if (loading) {
    return <div className="loading">Loading kanji data...</div>;
  }

  return (
    <div>
      <h1>{id ? 'Edit Kanji' : 'Add New Kanji'}</h1>

      {/* Show error message if there's an error */}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Kanji Character Input */}
        <div className="form-group">
          <label className="form-label">
            Kanji Character*
            <input
              type="text"
              name="kanji"
              value={formData.kanji}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter kanji character"
            />
          </label>
        </div>

        {/* Onyomi Reading Input */}
        <div className="form-group">
          <label className="form-label">
            Onyomi Reading
            <input
              type="text"
              name="onyomi"
              value={formData.onyomi}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter onyomi reading"
            />
          </label>
        </div>

        {/* Kunyomi Reading Input */}
        <div className="form-group">
          <label className="form-label">
            Kunyomi Reading
            <input
              type="text"
              name="kunyomi"
              value={formData.kunyomi}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter kunyomi reading"
            />
          </label>
        </div>

        {/* Meaning Input */}
        <div className="form-group">
          <label className="form-label">
            Meaning
            <input
              type="text"
              name="meaning"
              value={formData.meaning}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter meaning"
            />
          </label>
        </div>

        {/* Form Actions */}
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
