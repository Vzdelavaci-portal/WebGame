const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=GAME_CONFIG.width,H=GAME_CONFIG.height,groundY=GAME_CONFIG.groundY,castleX=GAME_CONFIG.castleX,spawnX=W+40;
const ui={gold:el('gold'),hp:el('castleHp'),wave:el('wave'),kills:el('kills'),score:el('score'),best:el('best'),overlay:el('overlay'),mine:el('costMine'),walls:el('costWalls'),smith:el('costBlacksmith')};
function el(id){return document.getElementById(id)}
function setup(){const r=Math.max(1,Math.min(devicePixelRatio||1,2));canvas.width=W*r;canvas.height=H*r;canvas.style.width='100%';canvas.style.height='auto';ctx.setTransform(r,0,0,r,0,0)}setup();
const unitsCfg=UNIT_CONFIG,enemiesCfg=ENEMY_CONFIG;
let units=[],enemies=[],projectiles=[],particles=[],texts=[];
let gold=GAME_CONFIG.startingGold,castleHp=GAME_CONFIG.startingCastleHp,castleMaxHp=GAME_CONFIG.startingCastleHp,wave=GAME_CONFIG.startingWave,kills=0,score=0,best=GameStorage.getBestScore();
let goldIncome=1,damageBonus=0,wallLvl=0,mineLvl=0,smithLvl=0,unitLevels=createUnitLevels(),running=false,paused=false,anim,spawnTimer=0,spawned=0,toSpawn=0,waveActive=false,waveDelay=140,goldTimer=0,shake=0,frame=0;
ui.best.textContent=best;
function createUnitLevels(saved={}){return Object.fromEntries(Object.keys(unitsCfg).map(type=>[type,Math.max(1,Math.min(UNIT_UPGRADE_CONFIG.maxLevel,validNumber(saved[type],1)))]))}
function startGame(){GameStorage.clearGame();units=[];enemies=[];projectiles=[];particles=[];texts=[];gold=GAME_CONFIG.startingGold;castleHp=GAME_CONFIG.startingCastleHp;castleMaxHp=GAME_CONFIG.startingCastleHp;wave=GAME_CONFIG.startingWave;kills=0;score=0;goldIncome=1;damageBonus=0;wallLvl=0;mineLvl=0;smithLvl=0;unitLevels=createUnitLevels();spawnTimer=0;spawned=0;toSpawn=countWave();waveActive=true;waveDelay=140;goldTimer=0;shake=0;frame=0;running=true;paused=false;ui.overlay.style.display='none';updateUI();cancelAnimationFrame(anim);loop()}
function getSaveState(){return{gold,castleHp,castleMaxHp,wave,kills,score,goldIncome,damageBonus,wallLvl,mineLvl,smithLvl,unitLevels,spawnTimer,spawned,toSpawn,waveActive,waveDelay,goldTimer,frame,units:units.filter(u=>!u.dead&&u.hp>0).map(u=>({...u})),enemies:enemies.filter(e=>!e.dead&&e.hp>0).map(e=>({...e}))}}
function saveCurrentGame(showMessage=true){if(!running)return false;let saved=GameStorage.saveGame(getSaveState());if(showMessage)text(W/2,105,saved?'GAME SAVED':'SAVE FAILED',saved?'#22c55e':'#dc2626');return saved}
function saveGameManually(){saveCurrentGame(true)}
function continueGame(){let s=GameStorage.loadGame();if(!s){showStartMenu();return}projectiles=[];particles=[];texts=[];gold=validNumber(s.gold,GAME_CONFIG.startingGold);castleHp=validNumber(s.castleHp,GAME_CONFIG.startingCastleHp);castleMaxHp=validNumber(s.castleMaxHp,GAME_CONFIG.startingCastleHp);wave=Math.max(1,validNumber(s.wave,1));kills=validNumber(s.kills,0);score=validNumber(s.score,0);goldIncome=Math.max(1,validNumber(s.goldIncome,1));damageBonus=validNumber(s.damageBonus,0);wallLvl=validNumber(s.wallLvl,0);mineLvl=validNumber(s.mineLvl,0);smithLvl=validNumber(s.smithLvl,0);unitLevels=createUnitLevels(s.unitLevels);units=Array.isArray(s.units)?s.units.filter(u=>u&&unitsCfg[u.type]).map(normalizeLoadedUnit):[];enemies=Array.isArray(s.enemies)?s.enemies.filter(e=>e&&enemiesCfg[e.type]).map(e=>({...e})):[];spawnTimer=validNumber(s.spawnTimer,0);spawned=validNumber(s.spawned,0);toSpawn=validNumber(s.toSpawn,countWave());waveActive=typeof s.waveActive==='boolean'?s.waveActive:true;waveDelay=validNumber(s.waveDelay,140);goldTimer=validNumber(s.goldTimer,0);frame=validNumber(s.frame,0);shake=0;running=true;paused=false;ui.overlay.style.display='none';updateUI();cancelAnimationFrame(anim);loop()}
function validNumber(value,fallback){return Number.isFinite(Number(value))?Number(value):fallback}
function unitStats(type,level=unitLevels[type]){let c=unitsCfg[type],m=UNIT_UPGRADE_CONFIG.levels[level];return{hp:Math.round(c.hp*m.hp),damage:Math.round(c.damage*m.damage)+damageBonus,rate:Math.max(20,Math.round(c.rate*m.rate))}}
function normalizeLoadedUnit(unit){let c=unitsCfg[unit.type],level=Math.max(1,Math.min(UNIT_UPGRADE_CONFIG.maxLevel,validNumber(unit.level,unitLevels[unit.type]||1))),stats=unitStats(unit.type,level);return{...unit,level,maxHp:validNumber(unit.maxHp,stats.hp),damage:validNumber(unit.damage,stats.damage),rate:validNumber(unit.rate,stats.rate),ranged:!!c.ranged,bolt:!!c.bolt,shield:!!c.shield,elite:!!c.elite,magic:!!c.magic,splash:c.splash||0,healer:!!c.healer,ability:level===3?UNIT_UPGRADE_CONFIG.units[unit.type].ability:null}}
function showStartMenu(){let canContinue=GameStorage.hasGame();ui.overlay.innerHTML=`<div class="panel"><h2>🏰 Brave Fortress V3</h2><p>Defend the fortress, develop your army and survive increasingly dangerous waves.</p><div class="menu-actions">${canContinue?'<button id="continueBtn">Continue</button>':''}<button id="newGameBtn">New Game</button></div></div>`;ui.overlay.style.display='grid';if(canContinue)el('continueBtn').onclick=continueGame;el('newGameBtn').onclick=startGame}
function loop(){if(!running)return;if(!paused){update();draw()}anim=requestAnimationFrame(loop)}
function update(){frame++;income();waves();updateUnits();updateEnemies();updateProjectiles();updParticles();updTexts();updateUI();if(shake>0)shake--}
function mineCost(){return 50+mineLvl*35}function wallsCost(){return 60+wallLvl*45}function smithCost(){return 70+smithLvl*50}
function income(){if(++goldTimer>=60){gold+=goldIncome;goldTimer=0}}
function countWave(){return WaveDirector.getEnemyCount(wave)}
function waves(){if(!waveActive){if(--waveDelay<=0){wave++;toSpawn=countWave();spawned=0;waveActive=true;text(W/2,82,WaveDirector.getTitle(wave),WaveDirector.getTitleColor(wave))}return}if(++spawnTimer>Math.max(34,95-wave*4)&&spawned<toSpawn){spawnForWave();spawned++;spawnTimer=0}if(spawned>=toSpawn&&enemies.length===0){waveActive=false;waveDelay=160;gold+=35+wave*5;text(W/2,82,`WAVE ${wave} CLEARED`,'#22c55e');saveCurrentGame(false)}}
function spawnForWave(){spawnEnemy(WaveDirector.getEnemyType(wave))}
function spawnEnemy(type,x=spawnX){let c=enemiesCfg[type],m=1+wave*.12;enemies.push({type,x,y:c.flying?groundY-105:groundY,hp:Math.floor(c.hp*m),maxHp:Math.floor(c.hp*m),damage:Math.floor(c.damage*(1+wave*.06)),range:c.range,speed:c.speed,rate:c.rate,cool:Math.random()*30,reward:c.reward,color:c.color,boss:!!c.boss,dragon:!!c.dragon,flying:!!c.flying,summons:!!c.summons,summonTimer:240})}
function spawnSkeleton(x){let c=enemiesCfg.skeleton;enemies.push({type:'skeleton',x,y:groundY,hp:c.hp+wave*3,maxHp:c.hp+wave*3,damage:c.damage,range:c.range,speed:c.speed,rate:c.rate,cool:20,reward:c.reward,color:c.color})}
function unitUpgradeCost(type){let level=unitLevels[type];return level>=UNIT_UPGRADE_CONFIG.maxLevel?null:UNIT_UPGRADE_CONFIG.units[type].costs[level-1]}
function upgradeUnitType(type){if(!running||paused)return;let cost=unitUpgradeCost(type);if(cost===null)return;if(gold<cost)return text(W/2,120,`Need ${cost} gold`,'#dc2626');gold-=cost;unitLevels[type]++;let level=unitLevels[type],stats=unitStats(type,level);units.filter(u=>u.type===type&&u.hp>0).forEach(u=>{let hpRatio=u.hp/u.maxHp;u.level=level;u.maxHp=stats.hp;u.hp=Math.max(1,Math.round(stats.hp*hpRatio));u.damage=stats.damage;u.rate=stats.rate;u.ability=level===3?UNIT_UPGRADE_CONFIG.units[type].ability:null});text(W/2,120,`${unitsCfg[type].name} LEVEL ${level}`,'#fbbf24');updateUI();saveCurrentGame(false)}
function spawnUnit(type){if(!running||paused)return;let c=unitsCfg[type],level=unitLevels[type],stats=unitStats(type,level);if(gold<c.cost){text(170,120,'Not enough gold','#dc2626');return}gold-=c.cost;units.push({type,level,x:castleX+55,y:groundY,hp:stats.hp,maxHp:stats.hp,damage:stats.damage,range:c.range,speed:c.speed,rate:stats.rate,cool:0,color:c.color,ranged:!!c.ranged,bolt:!!c.bolt,shield:!!c.shield,elite:!!c.elite,magic:!!c.magic,splash:c.splash||0,healer:!!c.healer,ability:level===3?UNIT_UPGRADE_CONFIG.units[type].ability:null});part(castleX+55,groundY,c.color,16)}
function updateUnits(){units.forEach(u=>{if(u.hp<=0){u.dead=true;part(u.x,u.y,u.color,18);return}if(u.healer){updateHealer(u);return}let t=nearestEnemy(u);if(t&&Math.abs(t.x-u.x)<=u.range){if(--u.cool<=0){attack(u,t);u.cool=u.rate}}else u.x+=u.speed;u.x=Math.min(u.x,W-60)});units=units.filter(u=>!u.dead)}
function updateHealer(u){let target=units.filter(a=>a!==u&&a.hp>0&&a.hp<a.maxHp).sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];if(target){let distance=Math.abs(target.x-u.x);if(distance<=u.range){if(--u.cool<=0){healUnit(u,target);u.cool=u.rate}}else u.x+=Math.sign(target.x-u.x)*u.speed}else{let front=units.filter(a=>a!==u&&!a.healer&&a.hp>0).sort((a,b)=>b.x-a.x)[0];if(front&&front.x-u.x>85)u.x+=u.speed}u.x=Math.max(castleX+45,Math.min(u.x,W-60))}
function healUnit(healer,target){let amount=healer.damage;target.hp=Math.min(target.maxHp,target.hp+amount);part(target.x,target.y-22,'#86efac',14);text(target.x,target.y-52,`+${amount} HP`,'#22c55e');if(healer.ability==='Group Heal')units.filter(u=>u!==target&&u.hp>0&&u.hp<u.maxHp&&Math.abs(u.x-target.x)<100).forEach(u=>{u.hp=Math.min(u.maxHp,u.hp+Math.round(amount*.55));part(u.x,u.y-20,'#bbf7d0',8)})}
function updateEnemies(){enemies.forEach(e=>{if(e.burnTicks>0){e.burnTicks--;if(e.burnTicks%30===0){e.hp-=e.burnDamage;part(e.x,e.y-20,'#f97316',6)}}if(e.hp<=0){e.dead=true;kills++;gold+=e.reward;score+=e.boss?500:50;text(e.x,e.y-44,`+${e.reward} gold`,'#fbbf24');part(e.x,e.y,e.color,e.boss?50:22);return}if(e.summons&&--e.summonTimer<=0){spawnSkeleton(e.x+35);e.summonTimer=300;text(e.x,e.y-55,'SUMMON','#e5e7eb')}let t=nearestUnit(e);if(t&&Math.abs(t.x-e.x)<=e.range){if(--e.cool<=0){e.dragon?dragonFire(e):hitUnit(e,t);e.cool=e.rate}}else if(e.x<=castleX+45){if(--e.cool<=0){hitCastle(e.damage);e.cool=e.rate}}else e.x-=e.speed});enemies=enemies.filter(e=>!e.dead)}
function nearestEnemy(u){return enemies.filter(e=>e.hp>0).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x))[0]}
function nearestUnit(e){return units.filter(u=>u.hp>0).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0]}
function attack(u,e){let crit=Math.random()<.1,dmg=crit?u.damage*2:u.damage;if(crit)text(e.x,e.y-70,'CRITICAL!','#facc15');if(u.ranged)projectiles.push({x:u.x+10,y:u.y-26,target:e,color:u.ability==='Burning Arrow'?'#f97316':u.color,damage:dmg,life:120,bolt:u.bolt,magic:u.magic,splash:u.splash,ability:u.ability});else{e.hp-=dmg;if(u.ability==='Cleave')enemies.filter(t=>t!==e&&t.hp>0&&Math.abs(t.x-e.x)<55).slice(0,2).forEach(t=>t.hp-=dmg*.5);if(u.ability==='Whirlwind')enemies.filter(t=>t!==e&&t.hp>0&&Math.abs(t.x-u.x)<75).forEach(t=>t.hp-=dmg*.45);part(e.x,e.y-18,u.color,crit?18:8)}}
function hitUnit(e,u){let damage=u.ability==='30% Block'?Math.ceil(e.damage*.7):e.damage;u.hp-=damage;part(u.x,u.y-20,e.color,8)}
function hitCastle(d){castleHp-=d;shake=8;part(castleX,groundY-70,'#dc2626',20);if(castleHp<=0)gameOver()}
function dragonFire(e){units.forEach(u=>{if(Math.abs(u.x-e.x)<=e.range){u.hp-=u.ability==='30% Block'?Math.ceil(e.damage*.7):e.damage;part(u.x,u.y-28,'#f97316',18)}});for(let i=0;i<30;i++)particles.push({x:e.x-42,y:e.y+8,vx:-Math.random()*5,vy:(Math.random()-.5)*3,life:32,color:Math.random()>.5?'#f97316':'#facc15'})}
function updateProjectiles(){projectiles.forEach(p=>{let e=p.target;if(!e||e.hp<=0){p.dead=true;return}let dx=e.x-p.x,dy=e.y-22-p.y,dist=Math.hypot(dx,dy);if(dist<8){e.hp-=p.damage;if(p.magic){let radius=p.ability==='Arcane Burst'?110:p.splash;let factor=p.ability==='Arcane Burst'?.8:.5;enemies.filter(t=>t!==e&&t.hp>0&&Math.abs(t.x-e.x)<radius).forEach(t=>{t.hp-=p.damage*factor;part(t.x,t.y-20,'#c084fc',12)});text(e.x,e.y-58,p.ability==='Arcane Burst'?'ARCANE BURST':'SPLASH','#d8b4fe')}if(p.ability==='Burning Arrow'){e.burnTicks=180;e.burnDamage=Math.max(1,Math.round(p.damage*.12));text(e.x,e.y-58,'BURN','#f97316')}if(p.ability==='Piercing Bolt'){let next=enemies.filter(t=>t!==e&&t.hp>0&&Math.abs(t.x-e.x)<100).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];if(next){next.hp-=p.damage*.6;part(next.x,next.y-18,p.color,12)}}p.dead=true;part(e.x,e.y-18,p.color,p.magic?24:p.bolt?18:10)}else{let speed=p.bolt?10:p.magic?7:8;p.x+=dx/dist*speed;p.y+=dy/dist*speed}p.life--});projectiles=projectiles.filter(p=>!p.dead&&p.life>0)}
function buyUpgrade(t){if(!running||paused)return;if(t==='mine'){let c=mineCost();if(gold<c)return text(200,120,`Need ${c} gold`,'#dc2626');gold-=c;mineLvl++;goldIncome++;text(260,120,'Gold income +1','#fbbf24')}if(t==='walls'){let c=wallsCost();if(gold<c)return text(200,120,`Need ${c} gold`,'#dc2626');gold-=c;wallLvl++;castleMaxHp+=120;castleHp=Math.min(castleMaxHp,castleHp+180);text(260,120,'Castle upgraded','#38bdf8')}if(t==='blacksmith'){let c=smithCost();if(gold<c)return text(200,120,`Need ${c} gold`,'#dc2626');gold-=c;smithLvl++;damageBonus+=4;units.forEach(u=>u.damage+=4);text(260,120,'Unit damage +4','#f97316')}updateUI()}
function draw(){ctx.imageSmoothingEnabled=false;ctx.save();ctx.translate(shake?(Math.random()-.5)*6:0,shake?(Math.random()-.5)*4:0);bg();buildings();castle();units.forEach(drawUnit);enemies.forEach(drawEnemy);projectiles.forEach(drawProj);drawParticles();drawTexts();waveInfo();ctx.restore()}
function bg(){let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#7dd3fc');g.addColorStop(.5,'#bfdbfe');g.addColorStop(1,'#fef3c7');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fde68a';ctx.beginPath();ctx.arc(760,90,46,0,Math.PI*2);ctx.fill();mountains();cloud(170,95,1);cloud(510,82,.8);tree(250,groundY+5,1);tree(875,groundY+5,.85);rock(690,groundY+35);rock(595,groundY+32);ctx.fillStyle='#166534';ctx.fillRect(0,groundY+15,W,H-groundY);ctx.fillStyle='#365314';ctx.fillRect(0,groundY+45,W,H-groundY);ctx.fillStyle='#78350f';ctx.fillRect(0,groundY+27,W,18);ctx.strokeStyle='rgba(120,53,15,.45)';ctx.lineWidth=2;for(let x=0;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,groundY+36);ctx.lineTo(x+36,groundY+36);ctx.stroke()}}
function mountains(){ctx.fillStyle='#64748b';poly([[-80,groundY+15],[160,150],[410,groundY+15]]);ctx.fillStyle='#475569';poly([[190,groundY+15],[430,115],[720,groundY+15]]);ctx.fillStyle='#64748b';poly([[580,groundY+15],[790,170],[1030,groundY+15]]);ctx.fillStyle='#e2e8f0';poly([[430,115],[392,174],[468,166]]);ctx.fillStyle='#cbd5e1';poly([[790,170],[760,220],[820,212]])}
function poly(p){ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);p.slice(1).forEach(v=>ctx.lineTo(v[0],v[1]));ctx.closePath();ctx.fill()}
function cloud(x,y,s){ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(x,y,20*s,0,Math.PI*2);ctx.arc(x+22*s,y-8*s,26*s,0,Math.PI*2);ctx.arc(x+50*s,y,20*s,0,Math.PI*2);ctx.fill()}
function tree(x,y,s){ctx.fillStyle='#78350f';ctx.fillRect(x-5*s,y-42*s,10*s,42*s);ctx.fillStyle='#166534';ctx.beginPath();ctx.arc(x,y-55*s,24*s,0,Math.PI*2);ctx.arc(x-15*s,y-38*s,18*s,0,Math.PI*2);ctx.arc(x+15*s,y-38*s,18*s,0,Math.PI*2);ctx.fill()}
function rock(x,y){ctx.fillStyle='#78716c';ctx.beginPath();ctx.ellipse(x,y,18,9,0,0,Math.PI*2);ctx.fill()}
function buildings(){if(mineLvl>0){ctx.fillStyle='#57534e';rr(160,groundY-25,55,45,8);ctx.fill();ctx.fillStyle='#1c1917';ctx.beginPath();ctx.arc(187,groundY+5,18,Math.PI,0);ctx.fill();ctx.strokeStyle='#78350f';ctx.lineWidth=3;line(140,groundY+22,225,groundY+22)}if(smithLvl>0){ctx.fillStyle='#92400e';rr(225,groundY-42,58,62,8);ctx.fill();ctx.fillStyle='#7f1d1d';poly([[215,groundY-42],[254,groundY-76],[293,groundY-42]]);ctx.fillStyle='#44403c';ctx.fillRect(272,groundY-83,13,42);ctx.fillStyle='rgba(120,113,108,.55)';ctx.beginPath();ctx.arc(280,groundY-92-Math.sin(frame*.05)*5,8,0,Math.PI*2);ctx.fill()}}
function castle(){
  ctx.save();

  const baseX = 22;
  const baseY = groundY - 178;

  const upgradeSize = wallLvl > 0 ? 18 : 0;
  const wallWidth = 150 + upgradeSize;
  const wallHeight = 208 + upgradeSize;

  // Main wall
  ctx.fillStyle = wallLvl > 0 ? '#8b8b82' : '#78716c';
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 3;

  rr(baseX, baseY - upgradeSize, wallWidth, wallHeight, 8);
  ctx.fill();
  ctx.stroke();

  // Stone blocks
  ctx.strokeStyle = 'rgba(68,64,60,.45)';
  ctx.lineWidth = 1;

  for (let y = baseY - upgradeSize + 22; y < baseY + wallHeight - 20; y += 24) {
    ctx.beginPath();
    ctx.moveTo(baseX + 8, y);
    ctx.lineTo(baseX + wallWidth - 8, y);
    ctx.stroke();
  }

  for (let x = baseX + 18; x < baseX + wallWidth - 10; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, baseY - upgradeSize + 20);
    ctx.lineTo(x, baseY + wallHeight - 8);
    ctx.stroke();
  }

  // Battlements
  ctx.fillStyle = '#57534e';
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;

  for (let i = 0; i < 6; i++) {
    const bx = baseX + 9 + i * 24;
    const by = baseY - 20 - upgradeSize;

    ctx.fillRect(bx, by, 15, 24);
    ctx.strokeRect(bx, by, 15, 24);
  }

  // Towers
  castleTower(baseX - 12, baseY - 42 - upgradeSize, 42, 250 + upgradeSize);
  castleTower(baseX + 54, baseY - 72 - upgradeSize, 48, 280 + upgradeSize);
  castleTower(baseX + 132 + upgradeSize, baseY - 42 - upgradeSize, 42, 250 + upgradeSize);

  // Optional extra tower after better walls
  if (wallLvl > 1) {
    castleTower(baseX + 178, baseY - 30, 34, 230);
  }

  // Gate
  ctx.fillStyle = '#78350f';
  rr(baseX + 58, groundY - 58, 44, 88, 18);
  ctx.fill();

  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(baseX + 80, groundY - 56, 22, Math.PI, 0);
  ctx.fill();

  // Gate lines
  ctx.strokeStyle = 'rgba(254,243,199,.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(baseX + 80, groundY - 58);
  ctx.lineTo(baseX + 80, groundY + 28);
  ctx.stroke();

  // Windows
  ctx.fillStyle = '#1e293b';
  rr(baseX + 25, baseY + 58, 14, 25, 5);
  ctx.fill();

  rr(baseX + 116, baseY + 58, 14, 25, 5);
  ctx.fill();

  rr(baseX + 73, baseY + 36, 14, 25, 5);
  ctx.fill();

  // Flag pole
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(baseX + 81, baseY - 118 - upgradeSize);
  ctx.lineTo(baseX + 81, baseY - 73 - upgradeSize);
  ctx.stroke();

  // Flag
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(baseX + 81, baseY - 118 - upgradeSize);
  ctx.lineTo(baseX + 123, baseY - 105 - upgradeSize);
  ctx.lineTo(baseX + 81, baseY - 92 - upgradeSize);
  ctx.closePath();
  ctx.fill();

  // HP bar
  const r = Math.max(0, castleHp / castleMaxHp);

  ctx.fillStyle = 'rgba(28,25,23,.9)';
  ctx.fillRect(baseX + 20, baseY - 38 - upgradeSize, 116, 12);

  ctx.fillStyle = r > .35 ? '#16a34a' : '#dc2626';
  ctx.fillRect(baseX + 20, baseY - 38 - upgradeSize, 116 * r, 12);

  ctx.restore();
}

function castleTower(x,y,w,h){
  ctx.fillStyle = '#69635d';
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 3;

  rr(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();

  // Roof
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(x - 7, y);
  ctx.lineTo(x + w / 2, y - 38);
  ctx.lineTo(x + w + 7, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Battlements on tower
  ctx.fillStyle = '#57534e';

  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 6 + i * 12, y + 6, 8, 12);
  }

  // Window
  ctx.fillStyle = '#1e293b';
  rr(x + w / 2 - 6, y + 56, 12, 25, 5);
  ctx.fill();
}

function tower(x,y,w,h){
  castleTower(x,y,w,h);
}
function drawUnit(u){if(u.type==='swordsman')human(u,'#b45309','#fef3c7','#78350f'),sword(u.x+12,u.y-28);if(u.type==='archer')human(u,'#15803d','#bbf7d0','#14532d'),bow(u.x+18,u.y-22);if(u.type==='knight')human(u,'#2563eb','#bfdbfe','#1e3a8a',true),sword(u.x+14,u.y-26);if(u.type==='crossbowman'){human(u,'#854d0e','#fde68a','#713f12');ctx.strokeStyle='#451a03';ctx.lineWidth=4;line(u.x+10,u.y-24,u.x+33,u.y-24);line(u.x+24,u.y-35,u.x+24,u.y-13)}if(u.type==='eliteKnight'){human(u,'#ca8a04','#fef08a','#713f12',true);ctx.fillStyle='#facc15';poly([[u.x-8,u.y-42],[u.x,u.y-58],[u.x+8,u.y-42]]);sword(u.x+16,u.y-30)}if(u.type==='mage'){human(u,'#7e22ce','#e9d5ff','#581c87');ctx.strokeStyle='#6b21a8';ctx.lineWidth=3;line(u.x+12,u.y-18,u.x+25,u.y-48);ctx.fillStyle='#c084fc';ctx.beginPath();ctx.arc(u.x+27,u.y-52,7,0,Math.PI*2);ctx.fill()}if(u.type==='healer'){human(u,'#f8fafc','#fef3c7','#ca8a04');ctx.strokeStyle='#facc15';ctx.lineWidth=3;line(u.x+12,u.y-18,u.x+24,u.y-47);ctx.fillStyle='#fef08a';ctx.beginPath();ctx.arc(u.x+25,u.y-51,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#22c55e';ctx.fillRect(u.x-3,u.y-18,6,16);ctx.fillRect(u.x-8,u.y-13,16,6)}hp(u,u.color,44,62);if(u.level>1){ctx.fillStyle='#facc15';ctx.font='bold 10px Georgia';ctx.textAlign='center';ctx.fillText('★'.repeat(u.level-1),u.x,u.y-69)}}
function human(u,body,skin,stroke,shield=false){ctx.fillStyle=skin;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();ctx.arc(u.x,u.y-28,8,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=body;rr(u.x-10,u.y-20,20,28,6);ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=3;line(u.x-7,u.y+8,u.x-14,u.y+23);line(u.x+7,u.y+8,u.x+14,u.y+23);if(shield){ctx.fillStyle='#93c5fd';ctx.beginPath();ctx.arc(u.x-18,u.y-13,10,0,Math.PI*2);ctx.fill();ctx.stroke()}}
function sword(x,y){ctx.strokeStyle='#d1d5db';ctx.lineWidth=4;line(x,y,x+18,y-20)}function bow(x,y){ctx.strokeStyle='#92400e';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,16,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.strokeStyle='#fde68a';ctx.lineWidth=2;line(x,y-16,x,y+16)}
function drawEnemy(e){if(e.type==='goblin')goblin(e);if(e.type==='orc')orc(e);if(e.type==='troll')troll(e);if(e.type==='skeleton')skeleton(e);if(e.type==='necromancer')necromancer(e);if(e.type==='boss')ogre(e);if(e.type==='dragon')dragon(e);hp(e,e.color,e.boss?72:44,e.dragon?96:62)}
function legs(e,c,w,a,b){ctx.strokeStyle=c;ctx.lineWidth=w;line(e.x-8,e.y+a,e.x-14,e.y+b);line(e.x+8,e.y+a,e.x+14,e.y+b)}
function goblin(e){ctx.fillStyle='#22c55e';ctx.strokeStyle='#052e16';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y-28,15,0,Math.PI*2);ctx.fill();ctx.stroke();legs(e,'#166534',3,-13,8);ctx.fillStyle='#052e16';ctx.beginPath();ctx.arc(e.x-5,e.y-31,2.5,0,Math.PI*2);ctx.arc(e.x+5,e.y-31,2.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#166534';poly([[e.x-12,e.y-38],[e.x-24,e.y-46],[e.x-10,e.y-32]]);poly([[e.x+12,e.y-38],[e.x+24,e.y-46],[e.x+10,e.y-32]])}
function orc(e){ctx.fillStyle='#ea580c';ctx.strokeStyle='#7c2d12';ctx.lineWidth=2;rr(e.x-16,e.y-46,32,36,8);ctx.fill();ctx.stroke();legs(e,'#7c2d12',4,-10,12);ctx.fillStyle='#7c2d12';ctx.beginPath();ctx.arc(e.x-6,e.y-33,3,0,Math.PI*2);ctx.arc(e.x+6,e.y-33,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d6d3d1';ctx.lineWidth=4;line(e.x+16,e.y-38,e.x+34,e.y-53)}
function troll(e){ctx.fillStyle='#7c3aed';ctx.strokeStyle='#4c1d95';ctx.lineWidth=2;rr(e.x-22,e.y-56,44,50,12);ctx.fill();ctx.stroke();legs(e,'#4c1d95',5,-6,20);ctx.fillStyle='#2e1065';ctx.beginPath();ctx.arc(e.x-8,e.y-40,3,0,Math.PI*2);ctx.arc(e.x+8,e.y-40,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a78bfa';rr(e.x-15,e.y-20,30,18,6);ctx.fill()}
function skeleton(e){ctx.strokeStyle='#e5e7eb';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y-32,10,0,Math.PI*2);ctx.moveTo(e.x,e.y-22);ctx.lineTo(e.x,e.y-5);ctx.moveTo(e.x-10,e.y-15);ctx.lineTo(e.x+10,e.y-15);ctx.moveTo(e.x,e.y-5);ctx.lineTo(e.x-10,e.y+14);ctx.moveTo(e.x,e.y-5);ctx.lineTo(e.x+10,e.y+14);ctx.stroke()}
function necromancer(e){ctx.fillStyle='#111827';ctx.strokeStyle='#a78bfa';ctx.lineWidth=2;rr(e.x-15,e.y-52,30,48,8);ctx.fill();ctx.stroke();ctx.fillStyle='#a78bfa';ctx.beginPath();ctx.arc(e.x,e.y-42,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a78bfa';ctx.lineWidth=3;line(e.x-18,e.y-35,e.x-28,e.y-62);legs(e,'#111827',4,-5,16)}
function ogre(e){ctx.fillStyle='#dc2626';ctx.strokeStyle='#7f1d1d';ctx.lineWidth=3;rr(e.x-30,e.y-72,60,66,14);ctx.fill();ctx.stroke();legs(e,'#7f1d1d',6,-8,24);ctx.fillStyle='#fbbf24';poly([[e.x-22,e.y-74],[e.x-11,e.y-96],[e.x,e.y-74],[e.x+11,e.y-96],[e.x+22,e.y-74]]);ctx.fillStyle='#450a0a';ctx.beginPath();ctx.arc(e.x-10,e.y-50,4,0,Math.PI*2);ctx.arc(e.x+10,e.y-50,4,0,Math.PI*2);ctx.fill()}
function dragon(e){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle='#b91c1c';ctx.strokeStyle='#7f1d1d';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,-28,48,24,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(-42,-38,20,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#dc2626';poly([[-8,-45],[28,-92],[36,-40]]);poly([[8,-45],[56,-82],[44,-30]]);ctx.strokeStyle='#7f1d1d';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(42,-25);ctx.quadraticCurveTo(76,-12,88,10);ctx.stroke();ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(-49,-44,4,0,Math.PI*2);ctx.fill();ctx.restore()}
function hp(e,c,w,off){let r=Math.max(0,e.hp/e.maxHp);ctx.fillStyle='rgba(28,25,23,.9)';ctx.fillRect(e.x-w/2,e.y-off,w,6);ctx.fillStyle=c;ctx.fillRect(e.x-w/2,e.y-off,w*r,6)}
function drawProj(p){ctx.fillStyle=p.color;ctx.strokeStyle=p.color;ctx.lineWidth=p.bolt?3:1;if(p.bolt){line(p.x-8,p.y,p.x+8,p.y)}else{ctx.beginPath();ctx.arc(p.x,p.y,p.magic?7:4,0,Math.PI*2);ctx.fill();if(p.magic){ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}}}
function waveInfo(){if(!waveActive&&waveDelay>0){ctx.fillStyle='rgba(68,45,27,.85)';ctx.strokeStyle='rgba(251,191,36,.65)';ctx.lineWidth=1.5;rr(W/2-130,20,260,40,20);ctx.fill();ctx.stroke();ctx.fillStyle='#fef3c7';ctx.font='bold 16px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`Next Wave: ${wave+1}`,W/2,40)}}
function part(x,y,c,n){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,life:30,color:c})}
function updParticles(){particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life--});particles=particles.filter(p=>p.life>0)}
function drawParticles(){particles.forEach(p=>{ctx.globalAlpha=p.life/30;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1})}
function text(x,y,value,color){texts.push({x,y,value,color,life:60})}function updTexts(){texts.forEach(t=>{t.y-=.6;t.life--});texts=texts.filter(t=>t.life>0)}
function drawTexts(){texts.forEach(t=>{ctx.globalAlpha=t.life/60;ctx.fillStyle=t.color;ctx.font='bold 16px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t.value,t.x,t.y);ctx.globalAlpha=1})}
function updateUnitUpgradeUI(){Object.keys(unitsCfg).forEach(type=>{let button=el(`upgrade-${type}`),level=unitLevels[type],upgrade=UNIT_UPGRADE_CONFIG.units[type],cost=unitUpgradeCost(type);if(!button)return;let maxed=cost===null,unaffordable=!maxed&&gold<cost,content=`${unitsCfg[type].name} Lv.${level}<span>${maxed?`${upgrade.ability} unlocked`:`Upgrade: ${cost} gold`}</span>`;button.disabled=maxed||unaffordable;button.classList.toggle('max-level',maxed);button.classList.toggle('unaffordable',unaffordable);if(button.innerHTML!==content)button.innerHTML=content})}
function updatePurchaseButtons(){document.querySelectorAll('.action-bar.units button[data-cost]').forEach(button=>{let unavailable=gold<Number(button.dataset.cost);button.disabled=unavailable;button.classList.toggle('unaffordable',unavailable)});let fortressButtons=[[el('buy-mine'),mineCost()],[el('buy-walls'),wallsCost()],[el('buy-blacksmith'),smithCost()]];fortressButtons.forEach(([button,cost])=>{if(!button)return;let unavailable=gold<cost;button.disabled=unavailable;button.classList.toggle('unaffordable',unavailable)})}
function updateUI(){ui.gold.textContent=Math.floor(gold);ui.hp.textContent=Math.max(0,Math.floor(castleHp));ui.wave.textContent=wave;ui.kills.textContent=kills;ui.score.textContent=score;ui.mine.textContent=`${mineCost()} gold`;ui.walls.textContent=`${wallsCost()} gold`;ui.smith.textContent=`${smithCost()} gold`;updateUnitUpgradeUI();updatePurchaseButtons();if(score>best){best=score;GameStorage.setBestScore(best);ui.best.textContent=best}}
function gameOver(){running=false;GameStorage.clearGame();cancelAnimationFrame(anim);showOverlay('💀 Castle Destroyed',`Final score: ${score}. You survived until wave ${wave}.`,'Play Again',startGame)}
function showOverlay(title,msg,btn,action){ui.overlay.innerHTML=`<div class="panel"><h2>${title}</h2><p>${msg}</p><button id="overlayBtn">${btn}</button></div>`;ui.overlay.style.display='grid';el('overlayBtn').onclick=action}
function togglePause(){if(!running)return;paused=!paused;if(paused)showOverlay('⏸️ Paused','Press P or click Continue.','Continue',togglePause);else ui.overlay.style.display='none'}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function line(x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function setupTabs(){let tabs=document.querySelectorAll('.tab-button'),panels=document.querySelectorAll('.dock-panel');tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(item=>item.classList.toggle('active',item===tab));panels.forEach(panel=>panel.classList.toggle('active',panel.dataset.panel===tab.dataset.tab))}))}
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='p')togglePause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)saveCurrentGame(false)});
window.addEventListener('beforeunload',()=>{if(running)saveCurrentGame(false)});
window.startGame=startGame;window.continueGame=continueGame;window.spawnUnit=spawnUnit;window.upgradeUnitType=upgradeUnitType;window.buyUpgrade=buyUpgrade;window.saveGameManually=saveGameManually;window.togglePause=togglePause;
setupTabs();bg();buildings();castle();updateUI();showStartMenu();
