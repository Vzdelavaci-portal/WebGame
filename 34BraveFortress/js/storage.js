const GameStorage = (() => {
  const keys = Object.freeze({
    bestScore: 'braveFortressBestV2',
    gameSave: 'braveFortressSaveV4',
    profile: 'braveFortressProfileV4'
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

  function loadProfile() {
    try {
      const profile = JSON.parse(localStorage.getItem(keys.profile));
      if (!profile || typeof profile !== 'object') {
        return { unlockedMaps: ['greenValley'], victories: {} };
      }

      return {
        unlockedMaps: Array.isArray(profile.unlockedMaps)
          ? [...new Set(['greenValley', ...profile.unlockedMaps])]
          : ['greenValley'],
        victories: profile.victories && typeof profile.victories === 'object'
          ? profile.victories
          : {}
      };
    } catch {
      return { unlockedMaps: ['greenValley'], victories: {} };
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(keys.profile, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }

  return Object.freeze({
    getBestScore,
    setBestScore,
    saveGame,
    loadGame,
    hasGame,
    clearGame,
    loadProfile,
    saveProfile
  });
})();
