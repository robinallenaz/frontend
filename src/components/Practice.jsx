import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Practice.css';

function Practice() {
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKanjiData();
  }, []);

  const fetchKanjiData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/random?limit=6`);
      const kanjiData = response.data;
      
      // Create pairs of cards (kanji and meaning)
      const cardPairs = kanjiData.flatMap(kanji => [
        { id: `k-${kanji._id}`, content: kanji.Kanji, type: 'kanji', pairId: kanji._id },
        { id: `m-${kanji._id}`, content: kanji.Meaning, type: 'meaning', pairId: kanji._id }
      ]);
      
      // Shuffle the cards
      const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      setSelectedCards([]);
      setMatchedPairs([]);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching kanji:', err);
      setError('Failed to load kanji data');
      setLoading(false);
    }
  };

  const handleCardClick = (cardId) => {
    if (
      selectedCards.length === 2 || // Don't allow more than 2 cards selected
      selectedCards.includes(cardId) || // Don't allow same card to be selected
      matchedPairs.some(pair => pair.includes(cardId)) // Don't allow matched cards to be selected
    ) {
      return;
    }

    const newSelectedCards = [...selectedCards, cardId];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      // Check for a match
      const [firstCard, secondCard] = newSelectedCards.map(id => 
        cards.find(card => card.id === id)
      );

      if (firstCard.pairId === secondCard.pairId) {
        // Match found
        setMatchedPairs([...matchedPairs, newSelectedCards]);
        setSelectedCards([]);
      } else {
        // No match - deselect cards after delay
        setTimeout(() => {
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const isCardSelected = (cardId) => {
    return selectedCards.includes(cardId);
  };

  const isCardMatched = (cardId) => {
    return matchedPairs.some(pair => pair.includes(cardId));
  };

  if (loading) return (
    <div className="practice-container">
      <h1>Loading Game...</h1>
    </div>
  );
  
  if (error) return (
    <div className="practice-container">
      <h1>Error</h1>
      <p>{error}</p>
      <button onClick={fetchKanjiData}>Try Again</button>
    </div>
  );

  return (
    <div className="practice-container">
      <h1>Kanji Matching Game</h1>
      <p>Match the kanji with its meaning!</p>
      
      <div className="game-board">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${isCardSelected(card.id) ? 'selected' : ''} ${
              isCardMatched(card.id) ? 'matched' : ''
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-content">
              {card.content}
            </div>
          </div>
        ))}
      </div>

      {matchedPairs.length === cards.length / 2 && (
        <div className="victory-message">
          <h2>Congratulations!</h2>
          <button onClick={fetchKanjiData}>Play Again</button>
        </div>
      )}
    </div>
  );
}

export default Practice;
