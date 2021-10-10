//外部モジュール化はサーバーを立てないと不可
class Charactor{
  constructor(name, imagePath, life, lv, type){
      this.name = name;
      this.face = `${imagePath}face.jpg`;
      if (type == Charactor.COM){
        this.icon = `${imagePath}icon.png`;
        this.defeatedIcon = `${imagePath}defeated_icon.png`;
      }
      this.life = life;
      this.lv = lv;
      this.type = type;
      this.maxLife = life;
      this.selection = null;
  }
  static COM = 0;
  static PLAYER = 1;

  lostLife(){
    if(this.lv < 50){
      this.life--;
    }else{
      this.life -= 0.5;
    }
  }

  getLostLifeInThisGame(){
    return this.maxLife - this.life;
  }

  selectHand(){
    let value;
    switch (getRandomInt0to(2)) {
      case 0:
        value = ROCK;
        break;
      case 1:
        value = PAPER;
        break;
      default:
        value = SCISSORS;
    }
    this.selection = ROCK;
  }
}

class SecretBoss extends Charactor {
  constructor(name, imagePath, life, lv, type){
    super(name, imagePath, life, lv, type);
    this.rock = `${imagePath}rock.jpg`;
    this.paper = `${imagePath}paper.jpg`;
    this.scissors = `${imagePath}scissors.jpg`;
    this.approaching = `${imagePath}approaching.jpg`;
    this.imagePath = imagePath;
    this.hand = null;
  }

  /**
   * 1/2の確率で確実に勝つ手を出す
   */
  selectHand(){
    switch (getRandomInt0to(1)) {
      case 0:
        super.selectHand();
        break;
      default:
        let value;
        switch (player.selection) {
          case ROCK:
            value = PAPER;
            break;
          case PAPER:
            value = SCISSORS;
            break;
          case SCISSORS:
            value = ROCK;
            break;
        }
        this.hand = `${this.imagePath}${value}.jpg`;
        this.selection = value;
    }
  }
}

let playerScore = 0;
let computerScore = 0;

const pLife = document.getElementById('player-life');
const cLife = document.getElementById('com-life');
const compSelect = document.getElementById('computerSelect');
const playerSelect = document.getElementById('playerSelect');
const message = document.getElementById('message');
const comImg = document.getElementById('com-img');
const comName = document.getElementById('com-name');

let comIcons = [
  document.getElementById('com0'),
  document.getElementById('com1'),
  document.getElementById('com2'),
]

const ROCK = 'rock';
const PAPER = 'paper';
const SCISSORS = 'scissors';
const MUTEKI = 'muteki';

//index.htmlから見た相対パス
const ASSET_PATH = './assets/'
const CHARACTOR_ASSET_PATH = `${ASSET_PATH}charactors/`;

const HEART = `<img src=${ASSET_PATH}heart.jpg class='col img-fluid p-0'>`;
const HEART_EMPTY = `<img src=${ASSET_PATH}heart-empty.jpg class='col img-fluid p-0'>`;
const HEART_HALF = `<img src=${ASSET_PATH}heart-half.jpg class='col img-fluid p-0'>`;
const COL = `<div class="col p-0"></div>`;

const MAX_LIFE_NUM = 7;
let bonusHertNum = 2;

let muteMode = false;

const player = new Charactor("タケミッチ", `${CHARACTOR_ASSET_PATH}takemichi`, 3, 50, Charactor.PLAYER);

const comsStage1 = [
  new Charactor("清水将貴", `${CHARACTOR_ASSET_PATH}kiyomizu/`, 3, 10, Charactor.COM)
];
const comsStage2 = [
  new Charactor("場地圭介", `${CHARACTOR_ASSET_PATH}baji/`, 4, 30, Charactor.COM),
  new Charactor("稀咲鉄太", `${CHARACTOR_ASSET_PATH}kisaki/`, 4, 30, Charactor.COM),
];
const comsStage3 = [
  new Charactor("龍宮寺堅", `${CHARACTOR_ASSET_PATH}doraken/`, 4, 50, Charactor.COM),
  new Charactor("佐野万次郎", `${CHARACTOR_ASSET_PATH}maiki/`, 3, 50, Charactor.COM)
];

//const coms = [getComRandom(comsStage1), getComRandom(comsStage2), getComRandom(comsStage3)];
const coms = [new Charactor("清水将貴", `${CHARACTOR_ASSET_PATH}kiyomizu/`, 1, 10, Charactor.COM),new Charactor("清水将貴", `${CHARACTOR_ASSET_PATH}kiyomizu/`, 1, 10, Charactor.COM),new Charactor("清水将貴", `${CHARACTOR_ASSET_PATH}kiyomizu/`, 1, 10, Charactor.COM)]

const secretBoss =   new SecretBoss("サザエさん", `${CHARACTOR_ASSET_PATH}sazae/`, 3, 49, Charactor.COM);

let stage = 1;
let com;

const WINNER_COLOR = 'green';
const LOSER_COLOR = 'red';

const PLAYER_WIN = 'Player1の勝ち！';
const COM_WIN = 'Computerの勝ち！';
const DRAW = 'あいこ';

let bgm = new Audio(`${ASSET_PATH}music/this_is_revenge.mp3`);
const secretBossBgm = new Audio(`${ASSET_PATH}music/sazaesan.mp3`);
const approachingSound = new Audio(`${ASSET_PATH}music/approaching.mp3`);

bgm.volume = 0.1;
secretBossBgm.volume = 0.3;

let goSecretBoss = true;

function playRound(player, com) {
  if (player.selection === com.selection) {
    return DRAW;
  } else if(player.selection == MUTEKI){
    bonusHertNum--;
    return PLAYER_WIN;
  } else if(com.selection == MUTEKI){
    return COM_WIN;
  } else if ((player.selection == ROCK) && (com.selection == SCISSORS)) {
    return PLAYER_WIN;
  } else if ((player.selection == PAPER) && (com.selection == ROCK)) {
    return PLAYER_WIN;
  } else if ((player.selection == SCISSORS) && (com.selection == PAPER)) {
    return PLAYER_WIN;
  }else if ((player.selection == ROCK) && (com.selection == PAPER)) {
    return COM_WIN;
  } else if ((player.selection == PAPER) && (com.selection == SCISSORS)) {
    return COM_WIN;
  } else if ((player.selection == SCISSORS) && (com.selection == ROCK)) {
    return COM_WIN;
  }
}

function displaySelection(charactor) {
  let displayed;
  switch(charactor.type){
    case Charactor.PLAYER:
      displayed = playerSelect;
      break;
    case Charactor.COM:
      displayed = compSelect;
      break;
  }
  if (charactor.selection == MUTEKI){
    displayed.innerHTML = `<i class="fas fa-hand-muteki"><img src="assets/muteki.png"/></i><br><span style="color: #007500;">無敵</span>`;
  } else {
    displayed.innerHTML = `<i class="fas fa-hand-${charactor.selection}"></i>`;
    displayed.style.color = '';
  }

  if (com.hand) {
    comImg.src = com.hand;
  }
}

function displaySelectionsBy(result){
  if (player.selection != MUTEKI){
    playerSelect.innerHTML = `<i class="fas fa-hand-${player.selection}"></i>`;
  }
  if (com.selection != MUTEKI) {
    compSelect.innerHTML = `<i class="fas fa-hand-${com.selection}"></i>`;
  }

  if (result === PLAYER_WIN) {
    playerSelect.style.color = WINNER_COLOR;
    compSelect.style.color = LOSER_COLOR;
  }
  if (result === COM_WIN) {
    compSelect.style.color = WINNER_COLOR;
    playerSelect.style.color = LOSER_COLOR;
  }
  if (result === DRAW) {
    compSelect.style.color = '';
    playerSelect.style.color = '';
  }
}

function resetSelectionDisplay(){
  playerSelect.innerHTML = '';
  compSelect.innerHTML = '';
  playerSelect.style.color = '';
  compSelect.style.color = '';
  message.innerHTML = 'じゃ〜んけ〜ん・・';
  if (com.hand) {
    comImg.src = com.face;
  }
}

function reflectLifeGuageBy(result) {
  switch(result){
    case PLAYER_WIN:
      com.lostLife();
      displayLifeGauge(com);
      break;
    case COM_WIN:
      player.lostLife();
      displayLifeGauge(player);
      break;
  }
}

function endGame(){
  return player.life <= 0 || coms.length < stage;
}

function endThisGame() {
  return player.life <= 0 || com.life == 0;
}

function whoWon() {
  if (com.life === 0) {
    alert('おめでとう！Player1の勝利！');
  } else {
    alert('Computerの勝利！残念でした〜');
  }
}

function reload() {
  setTimeout(function(){
    location.reload();
  }, 3000);
}

function displayLifeGauge(charactor){
  let displayed;
  switch(charactor.type){
    case Charactor.PLAYER:
      displayed = pLife;
      break;
    case Charactor.COM:
      displayed = cLife;
      break;
  }
  let lifeGauge = ``;
  let lifeGaugeLength = 0;
  for(let i = 1; i <= charactor.life; i++){
    lifeGauge += HEART;
    lifeGaugeLength++;
  }
  if(!Number.isInteger(charactor.life)){
    lifeGauge += HEART_HALF;
    lifeGaugeLength++;
  }
  let emptyHertNum = Number.isInteger(charactor.maxLife) ? Math.floor(charactor.getLostLifeInThisGame()) : Math.ceil(charactor.getLostLifeInThisGame());
  for(let i = 1; i <= emptyHertNum; i++){
    lifeGauge += HEART_EMPTY;
    lifeGaugeLength++;
  }
  for(let i = 0; i < MAX_LIFE_NUM - lifeGaugeLength; i++){
    lifeGauge += COL;
  }
  displayed.innerHTML = lifeGauge;
}

function initBoards() {
  const start = document.getElementById('start');
  const boards = document.getElementById('boards');
  const select = document.getElementById('select');
  const comlist = document.getElementById('com-list');
  const rule = document.getElementById('pri-rule-explanation');
  const ruleButton = document.getElementById('rule-button');
  start.style.display = 'none';
  rule.style.display = 'none';
  ruleButton.style.display = 'block';
  boards.style.display = 'block';
  select.style.display = 'block';
  comlist.style.display = 'block';
  bgmButton.style.display = 'block';
  message.innerHTML = '　'; //１行確保するために空白を入れておく
  bgm.play();
}

async function updateBoard(){
  resetBord();
  com = coms[stage - 1];
  displayLifeGauge(player);
  if (stage != 1 && bonusHertNum > 0) {
    await getBonusHearts();
  }
  await wait(2000);
  displayCom(com);
  if (isLastStage()) {
    muteki.remove();
  }
}

async function updateBoardForSecretBoss(){
  resetBord();
  com = secretBoss;
  displayLifeGauge(player);
  if (bonusHertNum > 0) {
    await getBonusHearts();
  }
  await wait(2000);
  if(!muteMode){
    bgm.pause();
    approachingSound.play();
  }
  await appearSpMessage(com.approaching, 800, approachingSound.duration * 1000)
  bgm = secretBossBgm;
  if(!muteMode) {
    bgm.play();
  }
  await wait(500);
  displayCom(com);
  muteki.remove();
}

function displayCom(com) {
  comName.innerHTML = com.name;
  comImg.src = com.face;
  displayLifeGauge(com);
  comIcons[stage - 1].src = com.icon;
}


async function appearSpMessage(messageImg, animationDuration, duration){
  const spMessage = document.getElementById('special-message');
  spMessage.innerHTML = `<img class="img-fluid" src=${messageImg}>`;
  spMessage.animate([
    {opacity: 0},
    {opacity: 1}
  ],
  {
    duration: animationDuration,
    fill: 'forwards'
  });
  await wait(duration);
  spMessage.animate([
    {opacity: 1},
    {opacity: 0}
  ],
  {
    duration: animationDuration,
    fill: 'forwards'
  });
}

function resetBord(){
  playerSelect.innerHTML = '';
  compSelect.innerHTML = '';
  playerSelect.style.color = '';
  compSelect.style.color = '';  comName.innerHTML = '？？？';
  comImg.src = `${ASSET_PATH}/question.jpg`;
  cLife.innerHTML = '';
}

function isLastStage(){
  return stage == coms.length;
}

async function getBonusHearts(){
  for(let i = 0; i < bonusHertNum; i++){
    player.life++;
    player.maxLife = player.life;
    await wait(500);
    displayLifeGauge(player);
  }
  bonusHertNum = 2;
}

function wait(ms) {
  return new Promise( resolve => { setTimeout( resolve, ms ) } );
}

function getRandomInt0to(num){
  let arr = [];
  for (let i = 0; i <= num; i++) {
    arr.push(i);
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

function getComRandom(coms){
  return coms[getRandomInt0to(coms.length - 1)];
}

const rock = document.getElementById('rock');
const paper = document.getElementById('paper');
const scissors = document.getElementById('scissors');
const muteki = document.getElementById('muteki');
const startGameButton = document.getElementById('startGame');
const bgmButton = document.getElementById('bgm-button');

function selectRock(){
  return new Promise(resolve => {
    rock.addEventListener("click", (e)=>{resolve(e.currentTarget.id)});
  })
}

function selectPaper(){
  return new Promise(resolve => {
    paper.addEventListener("click", (e)=>{resolve(e.currentTarget.id)});
  })
}
function selectScissors(){
  return new Promise(resolve => {
    scissors.addEventListener("click", (e)=>{resolve(e.currentTarget.id)});
  })
}
function selectMuteki(){
  return new Promise(resolve => {
    muteki.addEventListener("click", (e)=>{resolve(e.currentTarget.id)});
  })
}

bgmButton.addEventListener('click', (e)=>{
  if (muteMode){
    bgm.play();
    bgmButton.src = `${ASSET_PATH}icon-music-stop.png`;
    mute = false;
  } else {
    bgm.pause();
    bgmButton.src = `${ASSET_PATH}icon-music.png`;
    muteMode = true;
  }
})

startGameButton.addEventListener('click', (e)=>{
  initBoards();
  gameFlow();
});

async function gameFlow(){
  while(!endGame()){
    if (isLastStage() && goSecretBoss){
      await updateBoardForSecretBoss();
    } else {
      await updateBoard();
    }
    while(!endThisGame()){
      resetSelectionDisplay();
      player.selection = await Promise.any([selectRock(), selectPaper(), selectScissors(), selectMuteki()]);
      if (player.selection != MUTEKI) {
        goSecretBoss = false;
      }
      displaySelection(player);
      com.selectHand();
      displaySelection(com);
      message.innerHTML += 'ぽんっ！';
      await wait(1000);
      let result = playRound(player, com);
      displaySelectionsBy(result);
      reflectLifeGuageBy(result);
      message.innerText = result;
      await wait(2000);
    }
    comIcons[stage - 1].src = com.defeatedIcon;
    whoWon();
    stage++;
  }
  reload();
}