let playerScore = 0;
let computerScore = 0;
const pScore = document.getElementById('playerScore');
const cScore = document.getElementById('computerScore');
const compSelect = document.getElementById('computerSelect');
const playerSelect = document.getElementById('playerSelect');
const message = document.getElementById('message');
let gameActive = false;

function computerPlay() {
  let arr = [1, 2, 3];
  let random = arr[Math.floor(Math.random() * arr.length)];
  let value;
  switch (random) {
    case 1:
      value = 'rock';
      break;
    case 2:
      value = 'paper';
      break;
    default:
      value = 'scissors';
  }
  return value;
}

function playRound(playerSelection, computerSelection) {
  if (playerSelection === computerSelection) {
    return 'あいこ';
  } else if ((playerSelection == "rock") && (computerSelection == "scissors")) {
    return "Player1の勝ち！";
  } else if ((playerSelection == "paper") && (computerSelection == "rock")) {
    return "Player1の勝ち！";
  } else if ((playerSelection == "scissors") && (computerSelection == "paper")) {
    return "Player1の勝ち！";
  } else if ((playerSelection == "paper") && (computerSelection == "scissors")) {
    return "Computerの勝ち！";
  } else if ((playerSelection == "scissors") && (computerSelection == "rock")) {
    return "Computerの勝ち！";
  } else if ((playerSelection == "rock") && (computerSelection == "paper")) {
    return "Computerの勝ち！";
  }
}

function displaySelection(player, selection, result) {
  if (player === 'player') {
    playerSelect.innerHTML = `<i class="fas fa-hand-${selection}"></i>`;
    if (result === "Player1の勝ち！") {
      playerSelect.style.color = 'green';
      compSelect.style.color = 'red';
    }
  } else {
    compSelect.innerHTML = `<i class="fas fa-hand-${selection}"></i>`;
    if (result === "Computerの勝ち！") {
      compSelect.style.color = 'green';
      playerSelect.style.color = 'red';
    }
  }
  if (result === 'あいこ') {
    compSelect.style.color = '';
    playerSelect.style.color = '';
  }
}

function scoreBoard(result) {
  if (result === "Player1の勝ち！") {
    playerScore++;
    pScore.innerText = playerScore;
    cScore.innerText = computerScore;
  } else if (result === "Computerの勝ち！") {
    computerScore++;
    pScore.innerText = playerScore;
    cScore.innerText = computerScore;
  } else {
    return false;
  }
}

function endGame() {
  return playerScore === 5 || computerScore === 5;
}

function whoWon() {
  if (playerScore === 5) {
    message.innerText = 'Player1の勝利！おめでとう！'
  } else {
    message.innerText = 'Computerの勝利！残念でした〜'
  }
}

function reload() {
  setTimeout(function(){
    location.reload();
  }, 3000);
}


function initBoards() {
  const start = document.getElementById('start');
  const boards = document.getElementById('boards');
  const select = document.getElementById('select');
  start.style.display = 'none';
  boards.style.display = 'block';
  select.style.display = 'block';
  pScore.innerText = playerScore;
  cScore.innerText = computerScore;
  gameActive = true;
}

const rock = document.getElementById('rock');
const paper = document.getElementById('paper');
const scissors = document.getElementById('scissors');
const startGame = document.getElementById('startGame');

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

startGame.addEventListener('click', (e)=>{
  initBoards();
  gameFlow();
});

const gameFlow = async () => {
  while(!endGame()){
    let playerSelection = await Promise.any([selectRock(), selectPaper(), selectScissors()]);
    let computerSelection = computerPlay();
    let result = playRound(playerSelection, computerSelection);
    displaySelection('player', playerSelection, result);
    displaySelection('computer', computerSelection, result);
    scoreBoard(result);
    message.innerText = result;
  }
  whoWon();
  reload();
}
