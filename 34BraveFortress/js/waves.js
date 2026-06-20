const WaveDirector = (() => {
  function getEnemyCount(wave) {
    if (isBossWave(wave)) return 1;
    return 5 + wave * 2;
  }

  function getEnemyType(wave, random = Math.random()) {
    if (wave % 10 === 0) return 'dragon';
    if (wave % 5 === 0) return 'boss';
    if (wave >= 7 && random > 0.82) return 'necromancer';
    if (wave >= 4 && random > 0.78) return 'troll';
    if (wave >= 2 && random > 0.52) return 'orc';
    return 'goblin';
  }

  function getTitle(wave) {
    if (wave % 10 === 0) return `DRAGON WAVE ${wave}`;
    if (wave % 5 === 0) return `BOSS WAVE ${wave}`;
    return `WAVE ${wave}`;
  }

  function getTitleColor(wave) {
    if (wave % 10 === 0) return '#b91c1c';
    if (wave % 5 === 0) return '#dc2626';
    return '#fbbf24';
  }

  function isBossWave(wave) {
    return wave % 5 === 0;
  }

  return Object.freeze({
    getEnemyCount,
    getEnemyType,
    getTitle,
    getTitleColor,
    isBossWave
  });
})();

