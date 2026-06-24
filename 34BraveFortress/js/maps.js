const MAP_CONFIG = Object.freeze({
  greenValley: Object.freeze({
    name: 'Green Valley',
    icon: '🌲',
    description: 'Balanced starting region with increased passive income.',
    unlockWave: 0,
    effects: Object.freeze({
      incomeMultiplier: 1.2,
      unitSpeedMultiplier: 1,
      enemySpeedMultiplier: 1,
      hazardDamage: 0
    }),
    palette: Object.freeze({
      skyTop: '#7dd3fc',
      skyMiddle: '#bfdbfe',
      skyBottom: '#fef3c7',
      sun: '#fde68a',
      mountainFar: '#64748b',
      mountainNear: '#475569',
      ground: '#166534',
      groundDark: '#365314',
      road: '#78350f'
    })
  }),
  frozenKingdom: Object.freeze({
    name: 'Frozen Kingdom',
    icon: '❄️',
    description: 'Cold slows every army, but enemies are affected more.',
    unlockWave: 10,
    effects: Object.freeze({
      incomeMultiplier: 1,
      unitSpeedMultiplier: 0.88,
      enemySpeedMultiplier: 0.78,
      hazardDamage: 0
    }),
    palette: Object.freeze({
      skyTop: '#bae6fd',
      skyMiddle: '#e0f2fe',
      skyBottom: '#f8fafc',
      sun: '#e0f2fe',
      mountainFar: '#94a3b8',
      mountainNear: '#64748b',
      ground: '#dbeafe',
      groundDark: '#bfdbfe',
      road: '#94a3b8'
    })
  }),
  volcanicLands: Object.freeze({
    name: 'Volcanic Lands',
    icon: '🌋',
    description: 'Rich rewards, faster enemies and periodic castle damage.',
    unlockWave: 10,
    effects: Object.freeze({
      incomeMultiplier: 1.35,
      unitSpeedMultiplier: 1,
      enemySpeedMultiplier: 1.12,
      hazardDamage: 8
    }),
    palette: Object.freeze({
      skyTop: '#451a03',
      skyMiddle: '#7f1d1d',
      skyBottom: '#f97316',
      sun: '#fb923c',
      mountainFar: '#292524',
      mountainNear: '#1c1917',
      ground: '#3f3f46',
      groundDark: '#27272a',
      road: '#7c2d12'
    })
  })
});

const DIFFICULTY_CONFIG = Object.freeze({
  easy: Object.freeze({
    name: 'Easy',
    enemyHp: 0.82,
    enemyDamage: 0.8,
    reward: 1.15
  }),
  normal: Object.freeze({
    name: 'Normal',
    enemyHp: 1,
    enemyDamage: 1,
    reward: 1
  }),
  hard: Object.freeze({
    name: 'Hard',
    enemyHp: 1.3,
    enemyDamage: 1.25,
    reward: 1.25
  })
});

