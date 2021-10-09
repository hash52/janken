//外部モジュール化はサーバーを立てないと不可
class Charactor{
  constructor(name, imagePath, life, lv, type){
      this.name = name;
      this.face = imagePath;
      this.life = life;
      this.lv = lv;
      this.type = type;
      this.setMaxLife(life);
      this.selection = null;
  }
  static COM = 0;
  static PLAYER = 1;

  setMaxLife(maxLife){
    this.maxLife = maxLife;
  }

  getLostLife(){
    return this.maxLife - this.life;
  }
}

let playerScore = 0;
let computerScore = 0;

const pLife = document.getElementById('player-life');
const cLife = document.getElementById('com-life');
const compSelect = document.getElementById('computerSelect');
const playerSelect = document.getElementById('playerSelect');
const message = document.getElementById('message');

const ROCK = 'rock';
const PAPER = 'paper';
const SCISSORS = 'scissors';

//index.htmlから見た相対パス
const ASSET_PATH = './assets/'
const CHARACTOR_ASSET_PATH = `${ASSET_PATH}charactors/`;

const HEART = `<img src=${ASSET_PATH}heart.jpg class='col img-fluid p-0'>`;
const HEART_EMPTY = `<img src=${ASSET_PATH}heart-empty.jpg class='col img-fluid p-0'>`;

const player = new Charactor("タケミッチ", `${CHARACTOR_ASSET_PATH}takemichi/face.jpg`, 3, 1, Charactor.PLAYER);
const com = new Charactor("佐野万次郎", `${CHARACTOR_ASSET_PATH}maiki/face.jpg`, 3, 50, Charactor.COM);;

const WINNER_COLOR = 'green';
const LOSER_COLOR = 'red';

const PLAYER_WIN = 'Player1の勝ち！';
const COM_WIN = 'Computerの勝ち！';
const DRAW = 'あいこ';

function computerPlay() {
  let arr = [1, 2, 3];
  let random = arr[Math.floor(Math.random() * arr.length)];
  let value;
  switch (random) {
    case 1:
      value = ROCK;
      break;
    case 2:
      value = PAPER;
      break;
    default:
      value = SCISSORS;
  }
  return value;
}

function playRound(player, com) {
  if (player.selection === com.selection) {
    return DRAW;
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
  displayed.innerHTML = `<i class="fas fa-hand-${charactor.selection}"></i>`;
  displayed.style.color = '';
}

function displaySelectionsBy(result){
  playerSelect.innerHTML = `<i class="fas fa-hand-${player.selection}"></i>`;
  compSelect.innerHTML = `<i class="fas fa-hand-${com.selection}"></i>`;
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
}

function reflectLifeGuageBy(result) {
  switch(result){
    case PLAYER_WIN:
      com.life--;
      displayLifeGauge(com);
      break;
    case COM_WIN:
      player.life--;
      displayLifeGauge(player);
      break;
  }
}

function endGame() {
  return player.life == 0 || com.life == 0;
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
  for(let i = 0; i < charactor.life; i++){
    lifeGauge += HEART;
  }
  for(let i =0; i < charactor.getLostLife(); i++){
    lifeGauge += HEART_EMPTY;
  }
  displayed.innerHTML = lifeGauge;
}


async function initBoards() {
  const start = document.getElementById('start');
  const boards = document.getElementById('boards');
  const select = document.getElementById('select');
  const comName = document.getElementById('com-name');
  const comImg = document.getElementById('com-img');

  start.style.display = 'none';
  boards.style.display = 'block';
  select.style.display = 'block';
  displayLifeGauge(player);
  displayLifeGauge(com);
  message.innerHTML = '　'; //１行確保するために空白を入れておく

  await wait(1000);
  comName.innerHTML += com.name;
  comImg.src = com.face;
}

function wait(ms) {
  return new Promise( resolve => { setTimeout( resolve, ms ) } );
}

const rock = document.getElementById('rock');
const paper = document.getElementById('paper');
const scissors = document.getElementById('scissors');
const startGameButton = document.getElementById('startGame');

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

startGameButton.addEventListener('click', (e)=>{
  initBoards();
  gameFlow();
});

async function gameFlow(){
  while(!endGame()){
    resetSelectionDisplay();
    player.selection = await Promise.any([selectRock(), selectPaper(), selectScissors()]);
    displaySelection(player);
    com.selection = computerPlay();
    displaySelection(com);
    message.innerHTML += 'ぽんっ！';
    await wait(1000);
    let result = playRound(player, com);
    displaySelectionsBy(result);
    reflectLifeGuageBy(result);
    message.innerText = result;
    await wait(2000);
  }
  whoWon();
  reload();
}