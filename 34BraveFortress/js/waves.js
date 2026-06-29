const WaveDirector = (() => {
  function getEnemyCount(wave) {
    if (isBossWave(wave)) return 1;
    return 5 + wave * 2;
  }

  const mapEnemies = Object.freeze({
    greenValley: 'bandit',
    frozenKingdom: 'iceWraith',
    volcanicLands: 'lavaGolem'
  });

  function getEnemyType(wave, mapId = 'greenValley', random = Math.random()) {
    if (wave % 10 === 0 && typeof BOSS_CONFIG !== 'undefined') return BOSS_CONFIG[mapId]?.type || 'dragon';
    if (wave >= 3 && random > 0.86 && mapEnemies[mapId]) return mapEnemies[mapId];
    if (wave % 5 === 0) return 'boss';
    if (wave >= 7 && random > 0.82) return 'necromancer';
    if (wave >= 4 && random > 0.78) return 'troll';
    if (wave >= 2 && random > 0.52) return 'orc';
    return 'goblin';
  }

  function getTitle(wave, mapId = 'greenValley') {
    if (wave % 10 === 0 && typeof BOSS_CONFIG !== 'undefined') return `${BOSS_CONFIG[mapId]?.name || 'DRAGON'} WAVE ${wave}`;
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
