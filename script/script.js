//外部モジュール化はサーバーを立てないと不可
class Charactor{
  constructor(name, imagePath, life, lv, type){
      this.name = name;
      this.face = imagePath;
      this.life = life;
      this.lv = lv;
      this.type = type;
  }
  static COM = 0;
  static PLAYER = 1;
}

let playerScore = 0;
let computerScore = 0;

const pScore = document.getElementById('playerScore');
const cScore = document.getElementById('computerScore');
const compSelect = document.getElementById('computerSelect');
const playerSelect = document.getElementById('playerSelect');
const message = document.getElementById('message');
const victoryCondition = document.getElementById('victory-condition');

const VICTORY_SCORE = 2;

const ROCK = 'rock';
const PAPER = 'paper';
const SCISSORS = 'scissors';

//index.htmlから見た相対パス
const ASSET_PATH = './assets/charactors/'

const player = new Charactor("タケミッチ", `${ASSET_PATH}takemichi/face.jpg`, 3, 1, Charactor.PLAYER);
const com = new Charactor("佐野万次郎", `${ASSET_PATH}maiki/face.jpg`, 3, 50, Charactor.COM);;

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

function playRound(playerSelection, computerSelection) {
  if (playerSelection === computerSelection) {
    return DRAW;
  } else if ((playerSelection == ROCK) && (computerSelection == SCISSORS)) {
    return PLAYER_WIN;
  } else if ((playerSelection == PAPER) && (computerSelection == ROCK)) {
    return PLAYER_WIN;
  } else if ((playerSelection == SCISSORS) && (computerSelection == PAPER)) {
    return PLAYER_WIN;
  }else if ((playerSelection == ROCK) && (computerSelection == PAPER)) {
    return COM_WIN;
  } else if ((playerSelection == PAPER) && (computerSelection == SCISSORS)) {
    return COM_WIN;
  } else if ((playerSelection == SCISSORS) && (computerSelection == ROCK)) {
    return COM_WIN;
  }
}

function displaySelection(charactor, selection) {
  let displayed;
  switch(charactor.type){
    case Charactor.PLAYER:
      displayed = playerSelect;
      break;
    case Charactor.COM:
      displayed = compSelect;
      break;
  }
  displayed.innerHTML = `<i class="fas fa-hand-${selection}"></i>`;
  displayed.style.color = '';
}

function displayResult(playerSelection,computerSelection,result){
  playerSelect.innerHTML = `<i class="fas fa-hand-${playerSelection}"></i>`;
  compSelect.innerHTML = `<i class="fas fa-hand-${computerSelection}"></i>`;
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

function resetDisplay(){
  playerSelect.innerHTML = '';
  compSelect.innerHTML = '';
  playerSelect.style.color = '';
  compSelect.style.color = '';
  message.innerHTML = 'じゃ〜んけ〜ん・・';
}

function scoreBoard(result) {
  switch(result){
    case PLAYER_WIN:
      playerScore++;
      pScore.innerText = playerScore;
      cScore.innerText = computerScore;
      break;
    case COM_WIN:
      computerScore++;
      pScore.innerText = playerScore;
      cScore.innerText = computerScore;
      break;
    case DRAW:
      break;
  }
}

function endGame() {
  return playerScore === VICTORY_SCORE || computerScore === VICTORY_SCORE;
}

function whoWon() {
  if (playerScore === VICTORY_SCORE) {
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


async function initBoards() {
  const start = document.getElementById('start');
  const boards = document.getElementById('boards');
  const select = document.getElementById('select');
  const comName = document.getElementById('com-name');
  const comImg = document.getElementById('com-img');

  start.style.display = 'none';
  boards.style.display = 'block';
  select.style.display = 'block';
  pScore.innerText = playerScore;
  cScore.innerText = computerScore;
  victoryCondition.innerHTML = `先に${VICTORY_SCORE}勝した方が勝利！`
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
    resetDisplay();
    let playerSelection = await Promise.any([selectRock(), selectPaper(), selectScissors()]);
    displaySelection(player, playerSelection);
    let computerSelection = computerPlay();
    displaySelection(com, computerSelection);
    message.innerHTML += 'ぽんっ！';
    await wait(1000);
    let result = playRound(playerSelection, computerSelection);
    displayResult(playerSelection, computerSelection, result);
    scoreBoard(result);
    message.innerText = result;
    await wait(2000);
  }
  whoWon();
  reload();
}