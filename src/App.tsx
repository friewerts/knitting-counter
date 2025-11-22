import { useState, useEffect } from 'react';

function App() {
  // Initialize state from local storage or default to 0
  const [rowCount, setRowCount] = useState<number>(() => {
    const saved = localStorage.getItem('knitting-row-count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Persist to local storage whenever rowCount changes
  useEffect(() => {
    localStorage.setItem('knitting-row-count', rowCount.toString());
  }, [rowCount]);

  const [isResetting, setIsResetting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const incrementRow = () => {
    setRowCount(prev => prev + 1);
  };

  const handleResetClick = () => {
    if (isResetting) {
      setRowCount(0);
      setIsResetting(false);
    } else {
      setIsResetting(true);
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 200); // Short delay for UI update
      // Auto-cancel reset state after 3 seconds
      setTimeout(() => {
        setIsResetting(false);
        setIsTransitioning(false);
      }, 3000);
    }
  };

  // Derived state
  const currentRound = Math.floor(rowCount / 8) + 1;
  const currentRowInRound = (rowCount % 8) + 1;

  const TOTAL_ROUNDS = 54;
  const INCREASE_ROUNDS = 27;
  
  let phase = '';
  let displayRound = 0;
  let displayTotalRounds = INCREASE_ROUNDS;

  if (currentRound <= INCREASE_ROUNDS) {
    phase = 'Zunahme';
    displayRound = currentRound;
  } else if (currentRound <= TOTAL_ROUNDS) {
    phase = 'Abnahme';
    displayRound = currentRound - INCREASE_ROUNDS;
  } else {
    phase = 'Fertig';
    displayRound = INCREASE_ROUNDS;
  }

  const isFinished = currentRound > TOTAL_ROUNDS;
  
  // Total progress
  const totalProgress = Math.min((rowCount / (TOTAL_ROUNDS * 8)) * 100, 100);

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Sophie Scarf</h1>
        
        {isFinished ? (
          <div className="finished-state">
            <h2>Glückwunsch!</h2>
            <p>Du hast den Schal fertiggestellt.</p>
            <button className="reset-btn" onClick={() => setRowCount(0)}>Neuer Schal</button>
          </div>
        ) : (
          <>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Phase</span>
                <span className="value">{phase}</span>
              </div>
              <div className="info-item">
                <span className="label">Runde</span>
                <span className="value">{displayRound} <span className="total">/ {displayTotalRounds}</span></span>
              </div>
            </div>

            <div className="counter-display">
              <div className="row-label">Reihe</div>
              <div className="row-number">{currentRowInRound}</div>
              <div className="row-total">von 8</div>
            </div>

            <button className="increment-btn" onClick={incrementRow}>
              Reihe fertig!
            </button>

            <div className="progress-section">
              <div className="progress-label">Gesamtfortschritt</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${totalProgress}%` }}></div>
              </div>
            </div>

            <button 
              className={`reset-text-btn ${isResetting ? 'confirm-reset' : ''}`} 
              onClick={handleResetClick}
              disabled={isTransitioning}
            >
              {isResetting ? 'Wirklich zurücksetzen?' : 'Zurücksetzen'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
