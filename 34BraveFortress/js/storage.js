const GameStorage = (() => {
  const keys = Object.freeze({
    bestScore: 'braveFortressBestV2',
    gameSave: 'braveFortressSaveV3'
  });

  function readNumber(key, fallback = 0) {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? value : fallback;
  }

  function getBestScore() {
    return readNumber(keys.bestScore);
  }

  function setBestScore(score) {
    localStorage.setItem(keys.bestScore, String(score));
  }

  function saveGame(state) {
    try {
      const payload = {
        version: GAME_CONFIG.saveVersion,
        savedAt: new Date().toISOString(),
        state
      };

      localStorage.setItem(keys.gameSave, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  function loadGame() {
    try {
      const payload = JSON.parse(localStorage.getItem(keys.gameSave));
      if (
        !payload ||
        payload.version !== GAME_CONFIG.saveVersion ||
        !payload.state ||
        typeof payload.state !== 'object'
      ) {
        return null;
      }

      return payload.state;
    } catch {
      return null;
    }
  }

  function clearGame() {
    localStorage.removeItem(keys.gameSave);
  }

  function hasGame() {
    return loadGame() !== null;
  }

  return Object.freeze({
    getBestScore,
    setBestScore,
    saveGame,
    loadGame,
    hasGame,
    clearGame
  });
})();
