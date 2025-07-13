import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Practice.css';

const Practice = () => {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showDefaultSetMessage, setShowDefaultSetMessage] = useState(false);

  // Load saved state on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('kanjiHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }

    const savedGameState = localStorage.getItem('kanjiGameState');
    if (savedGameState) {
      const { cards, matchedPairs, score } = JSON.parse(savedGameState);
      setCards(cards);
      setMatchedPairs(matchedPairs);
      setScore(score);
    } else {
      fetchRandomKanji();
    }
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    if (cards.length > 0) {
      const gameState = {
        cards,
        matchedPairs,
        score
      };
      localStorage.setItem('kanjiGameState', JSON.stringify(gameState));
    }
  }, [cards, matchedPairs, score]);

  // Update high score when score changes
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('kanjiHighScore', score.toString());
    }
  }, [score, highScore]);

  const fetchRandomKanji = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/random?limit=6`);
      const { kanji, isDefaultSet } = response.data;
      
      setShowDefaultSetMessage(isDefaultSet);

      // Create card pairs (kanji and meaning)
      const cardPairs = kanji.flatMap(k => [
        { id: `k-${k.Kanji}`, content: k.Kanji, type: 'kanji', pair: k.Meaning },
        { id: `m-${k.Kanji}`, content: k.Meaning, type: 'meaning', pair: k.Kanji }
      ]);

      // Shuffle the cards
      const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      setSelectedCard(null);
      setMatchedPairs([]);
      setScore(0);
    } catch (error) {
      console.error('Error fetching kanji:', error);
    }
  };

  const handleCardClick = (card) => {
    if (matchedPairs.includes(card.id)) {
      return; // Ignore clicks on matched cards
    }

    if (!selectedCard) {
      // First card selected
      setSelectedCard(card);
    } else {
      // Second card selected
      if (selectedCard.id === card.id) {
        return; // Same card clicked twice
      }

      // Check for a match
      if ((selectedCard.pair === card.content) || (card.pair === selectedCard.content)) {
        // Match found
        const newPair = [selectedCard.id, card.id];
        setMatchedPairs([...matchedPairs, ...newPair]);
        setScore(score + 1);
      }
      
      // Reset selection
      setSelectedCard(null);
    }
  };

  return (
    <div className="practice-container">
      {showDefaultSetMessage && (
        <div className="default-set-message">
          <p>Your collection is empty! Using a set of basic kanji for practice.</p>
          <button onClick={() => setShowDefaultSetMessage(false)}>Got it!</button>
        </div>
      )}
      <div className="game-header">
        <h2>Match the Kanji</h2>
        <div className="score-container">
          <div className="score">Score: {score}</div>
          <div className="high-score">High Score: {highScore}</div>
        </div>
        <button onClick={fetchRandomKanji} className="reset-button">New Game</button>
      </div>
      <div className="card-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${selectedCard?.id === card.id ? 'selected' : ''} 
                       ${matchedPairs.includes(card.id) ? 'matched' : ''}`}
            onClick={() => handleCardClick(card)}
          >
            <div className="card-content" data-type={card.type}>
              {card.content}
            </div>
          </div>
        ))}
      </div>
      {matchedPairs.length === cards.length && cards.length > 0 && (
        <div className="victory-message">
          <h2>Congratulations!</h2>
          <p>You've matched all the pairs!</p>
          <button onClick={fetchRandomKanji}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default Practice;
