const DEBUG = true;

//外部モジュール化はサーバーを立てないと不可
class Charactor{
  constructor(data, imagePath, life){
      this.name = data.name;
      this.face = `${imagePath}face.jpg`;
      this.life = life;
      this.maxLife = life;
      this.selection = null;
      this.loseLife = 1;
  }

  lostLife(){
    this.life -= this.loseLife;
    if(this.life < 0){
      this.life = 0;
    }
  }

  attack(subject){
    subject.lostLife();
  }

  getLostLifeInThisGame(){
    return this.maxLife - this.life;
  }

  getDialogAtRandom(dialogs){
    return dialogs[getRandomInt0to(dialogs.length - 1)];
  }
}

class Player extends Charactor {
  constructor(data, imagePath, life){
    super(data, imagePath, life);
    this.inspiringDialogs = data.inspire;
    this.defeatedFace = `${imagePath}defeated_face.jpg`;
    this.awakeningFace = `${imagePath}awakening_face.jpg`;
    this.superAwakenFace = `${imagePath}super_awakening_face.jpg`
    this.isAwakening = false;
    this.isSuperAwakening = false;
  }

  lostLife(){
    super.lostLife();
    if (this.life == 0) {
      //ステージ３で２度目以降に負けそうになったら2/3でlife=0.1
      if (this.isSuperAwakening) {
        switch(getRandomInt0to(2)) {
          case 0:
            this.life = 0;
            break;
          default:
            displayDialog(this.getDialogAtRandom(this.inspiringDialogs),"player");
            awakenSound.play();
            this.life = 0.1;
        }
        if(DEBUG){
          awakenSound.play();
          displayDialog(this.getDialogAtRandom(this.inspiringDialogs),"player");
          this.life = 0.1;
        }
      }
    }
  }

  awaken(){
    this.isAwakening = true;
    this.loseLife = 0.5;
    if(stage != coms.length){
      caution.style.display = 'block';
    }
  }

  cancelAwaken(){
    this.isAwakening = false;
    this.loseLife = 1;
    caution.style.display = 'none';
  }

  canAwaken(){
    return this.life <= this.maxLife / 2 && !this.isAwakening && !this.isSuperAwakening;
  }

  async superAwaken(){
    this.life = 0.1;
    this.isSuperAwakening = true;
    bgm.pause();
    await wait(1500);
    hinataVoice.play();
    await appearMessage(HINATA_IMG, 700, hinataVoice.duration * 1000, false, movieMessage);
    awakenSound.play();
    playerFace.src = this.superAwakenFace;
    displayLifeGauge(player);
    await wait(awakenSound.duration * 1000);
    setBgm(superAwakenBgm);
    bgm.play();
  }
}

class Computer extends Charactor {
  constructor(data, imagePath, life){
    super(data, imagePath, life);
    this.icon = `${imagePath}icon.png`;
    this.greetings = data.greeting;
    this.winDialogs = data.win;
    this.loseDialogs = data.lose;
    this.defeatedIcon = `${imagePath}defeated_icon.png`;
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
    return this.selection = DEBUG ? ROCK : value;
  }

  getRandomLoseDialog(){
    return this.getDialogAtRandom(this.loseDialogs);
  }
}

class Boss extends Computer {
  constructor(data, imagePath, life){
    super(data, imagePath, life);
    this.loseLife = 0.5
    this.lastDialogs = data.last;
  }

  /**
   * 1/3の確率で確実に勝てる手を出す（勝率 2/9）
   */
   selectHand(){
    switch (getRandomInt0to(2)) {
      case 0:
        this.selection = this.getWinHand();
        break;
      default:
        super.selectHand();
    }
  }

  getWinHand(){
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
    return value;
  }

  getRandomLoseDialog(){
    if (this.life > 0) {
      return super.getRandomLoseDialog();
    } else {
      return this.getDialogAtRandom(this.lastDialogs);
    }
  }
}

class SecretBoss extends Boss {
  constructor(data, imagePath, life){
    super(data, imagePath, life);
    this.approaching = `${imagePath}approaching.jpg`;
    this.imagePath = imagePath;
    this.hand = null;
  }

  /**
   * 2/3の確率で確実に勝つ手を出す（勝率 1/9）
   */
  selectHand(){
    switch (getRandomInt0to(2)) {
      case 0:
        super.selectHand();
        break;
      default:
        this.selection = this.getWinHand();
    }
    
    this.hand = `${this.imagePath}${this.selection}.jpg`;
  }
}

const takemiData = {
  name: "タケミっち",
  inspire: [
    ["オレが変わらないと", "何も変えれない"],
    ["引けねえんだよ！！", "引けねえ理由があるんだよ！！！！"],
    ["オレが逃げたら", "ここで終わりだ"],
    ["これはオレの人生の", "リベンジだ"],
    ["オレはッッ", "花垣武道だ！！！"],
    ["オレは一人でも・・・", "引くワケにはいかねぇ・・！！"],
    ["諦めねぇ・・・！！！"]
  ]
}

const kiyomizuData = {
  name: "清水将貴",
  greeting: [
    ["バット持ってこい"],
    ["ウチの２年", "嗅ぎ回ってんの", "テメーらか？"]
  ],
  win: [
    ["やってやったぜ"],
    ["しゃあ！"]
  ],
  lose: [
    ["ちくしょう！"],
    ["うガァ！"]
  ]
}

const bajiData = {
  name: "場地圭介",
  greeting: [
    ["結果今日が", "決戦になった", "だけの話"],
    ["場地圭介だ！！！"],
    ["てめぇら　マイキーの", "愛車に手ぇ出したら", "殺すゾ！！"]
  ],
  win: [
    ["チェックメイトだ"],
    ["上等　上等"],
    ["オレの愛車が", "東京一だ"]
  ],
  lose: [
    ["オマエには", "殺られねぇ"],
    ["上等　上等"],
    ["カスリ傷だ"]
  ]
}

const kisakiData = {
  name: "稀咲鉄太",
  greeting: [
    ["大将は", "ウチの隊が責任持って", "守らせてもらう！！"],
    ['横浜”天竺”', "稀咲鉄太だ！"]
  ],
  win: [
    ["お前", "何びびってんだよ"],
    ["待ってたぜ"],
  ],
  lose: [
    ["・・・ハハ", "やっぱりそうか・・・"],
    ["じゃあな！"]
  ]
}

const dorakenData = {
  name: "龍宮寺堅",
  greeting: [
    ["ケンじゃねえよ", "”ドラケン”だ！"],
    ["外のヤツらは", "全員ノシた！"]
  ],
  win: [
    ["攻めあるのみ"],
    ["黙ってろ"],
    ["オマエみたいな奴は", "そーいねえ"]
  ],
  lose: [
    ["今ぁ", "準備運動が", "終わったトコだ"],
    ["嬉しいぜ！", "久しぶりに本気になれそうだ！"],
    ["上等だ・・・"]
  ],
  last: [
    ["マイキーを","頼む"]
  ]
}

const maikiData = {
  name: "佐野万次郎",
  greeting: [
    ["楽しめよ", "・・祭りだぜ！？"],
    ["日和ってる奴いる？", "・・いねえよなぁ！！？"]
  ],
  win: [
    ["”無敵”のマイキー", "だぜ？"],
    ["なーんてね"],
    ["オレが後ろにいる限り","誰も負けねえんだよ！！"]
  ],
  lose: [
    ["心がついてこねえ"],
    ["オマエ", "負けてねえよ"],
    ["・・・！"]
  ],
  last: [
    ["タケミっち", "今日から", "俺のダチな❤️"]
  ]
}

const sazaeData = {
  name: "サザエさん",
  greeting: [
    ["じゃんけんで","わたしに勝てると","思ってるのかしら？"],
  ],
  win: [
    ["うふふふふ"]
  ],
  lose: [
    ["あ", "やべえ"]
  ],
  last: [
    ["来週も","また見てくださいね"]
  ]
}

let playerScore = 0;
let computerScore = 0;

hasAwakenInStage = false;

const pLife = document.getElementById('player-life');
const cLife = document.getElementById('com-life');
const compSelect = document.getElementById('computerSelect');
const playerSelect = document.getElementById('playerSelect');
const message = document.getElementById('message');
const spMessage = document.getElementById('special-message');
const movieMessage = document.getElementById('movie-message');
const playerFace = document.getElementById('player-face');
const comFace = document.getElementById('com-face');
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
const HEART_FEW = `<img src=${ASSET_PATH}heart-few.jpg class='col img-fluid p-0'>`;
const COL = `<div class="col p-0"></div>`;

const MAX_LIFE_NUM = 7;
let bonusHertNum = 2;

let muteMode = false;

const player = new Player(takemiData, `${CHARACTOR_ASSET_PATH}takemichi/`, 3);

const comsStage1 = [
  new Computer(kiyomizuData, `${CHARACTOR_ASSET_PATH}kiyomizu/`, 3)
];
const comsStage2 = [
  new Computer(bajiData, `${CHARACTOR_ASSET_PATH}baji/`, 4),
  new Computer(kisakiData, `${CHARACTOR_ASSET_PATH}kisaki/`, 4),
];
const comsStage3 = [
  new Boss(dorakenData, `${CHARACTOR_ASSET_PATH}doraken/`, 4),
  new Boss(maikiData, `${CHARACTOR_ASSET_PATH}maiki/`, 3)
];

const secretBoss =   new SecretBoss(sazaeData, `${CHARACTOR_ASSET_PATH}sazae/`, 3);

let coms;
if (DEBUG) {
  coms = [
    new Computer(kiyomizuData, `${CHARACTOR_ASSET_PATH}kiyomizu/`, 1),
    new Computer(kiyomizuData, `${CHARACTOR_ASSET_PATH}kiyomizu/`, 3),
    new Boss(maikiData, `${CHARACTOR_ASSET_PATH}maiki/`, 3)
  ];
} else {
  coms = [getComRandom(comsStage1), getComRandom(comsStage2), getComRandom(comsStage3)];  
}

let stage = 1;
let com;

const WINNER_COLOR = 'green';
const LOSER_COLOR = 'red';

const PLAYER_WIN = 'Player1の勝ち！';
const COM_WIN = 'Computerの勝ち！';
const DRAW = 'あいこ';

const MUSIC_PATH = `${ASSET_PATH}music/`;

let defaultBgm = new Audio(`${MUSIC_PATH}this_is_revenge.mp3`);
const secretBossBgm = new Audio(`${MUSIC_PATH}sazaesan.mp3`);
const superAwakenBgm = new Audio(`${MUSIC_PATH}crybaby.mp3`);
const approachingSound = new Audio(`${MUSIC_PATH}approaching.mp3`);
const awakenSound = new Audio(`${MUSIC_PATH}awaken.mp3`);
const hinataVoice = new Audio(`${MUSIC_PATH}hinata_voice.mp3`);

const HINATA_IMG = `${ASSET_PATH}hinata.jpg`;
const THANKS_IMG = `${ASSET_PATH}thankyou.jpg`;

defaultBgm.volumeConf = 0.1;
defaultBgm.loop = true;
secretBossBgm.volumeConf = 0.3;
secretBossBgm.loop = true;
superAwakenBgm.volumeConf = 0.2;
superAwakenBgm.loop = true;
superAwakenBgm.currentTime = 40;

approachingSound.volumeConf = 0.7;
//FIXME 覚醒音はBGMに重ねるので、volumeConfを使って音量を制御できない
awakenSound.volume = 0.5;
hinataVoice.volume = 0.5;

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
  if (charactor instanceof Player) {
    displayed = playerSelect;
  } else {
    displayed = compSelect;
  }
  if (charactor.selection == MUTEKI){
    displayed.innerHTML = `<i class="fas fa-hand-muteki"><img src="assets/muteki.png"/></i><br><span style="color: #007500;">無敵</span>`;
  } else {
    displayed.innerHTML = `<i class="fas fa-hand-${charactor.selection}"></i>`;
    displayed.style.color = '';
  }

  if (com.hand) {
    comFace.src = com.hand;
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
    comFace.src = com.face;
  }
  resetDialog("com");
  resetDialog("player");
}

function reduceLifeGuageBy(result) {
  switch(result){
    case PLAYER_WIN:
      player.attack(com);
      displayLifeGauge(com);
      break;
    case COM_WIN:
      com.attack(player);
      displayLifeGauge(player);
      break;
  }
}

function endGame(){
  return player.life <= 0 || coms.length < stage;
}

function endStage() {
  return player.life <= 0 || com.life <= 0;
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
  if (charactor instanceof Player) {
    displayed = pLife;
  } else {
    displayed = cLife;
  }
  let lifeGauge = ``;
  let lifeGaugeLength = 0;
  for(let i = 1; i <= charactor.life; i++){
    lifeGauge += HEART;
    lifeGaugeLength++;
  }
  if(!Number.isInteger(charactor.life)){
    if (charactor.life == 0.1) {
      lifeGauge += HEART_FEW;
    } else {
      lifeGauge += HEART_HALF;
    }
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

function initComLifeGauge() {
  let lifeGuage = HEART_EMPTY;
  for(let i = 0; i < MAX_LIFE_NUM - 1; i++){
    lifeGuage += COL;
  }
  cLife.innerHTML = lifeGuage;
}

function awakenOn(){
  if(!muteMode){
    awakenSound.play();
  }
  player.awaken();
  playerFace.src = player.awakeningFace;
  hasAwakenInStage = true;
}

function awakenOff(){
  player.cancelAwaken();
  playerFace.src = player.face;
}

const comDialog = document.getElementById('com-dialog');
const playerDialog = document.getElementById('player-dialog');

async function displayDialog(dialogs, which){
  resetDialog(which);
  let displayed;
  if (which == "player") {
    displayed = playerDialog;
  } else {
    displayed = comDialog;
  }
  for (let i = 0; i < 3; i++) {
    let dialog = dialogs[i];
    if (!dialog) {
      dialog = `&nbsp;`;
      displayed.children[i] = dialog;
    } else {
      let strings = dialog.split('');
      for(let j = 0; j < strings.length; j++){
        await wait(75);
        displayed.children[i].innerHTML += strings[j];
      }
    }
    await wait(150);
  }
}

function resetDialog(which){
  let displayed;
  if (which == "player") {
    displayed = playerDialog;
  } else {
    displayed = comDialog;
  }
  displayed.innerHTML = `<h4>&nbsp;</h4><h4>&nbsp;</h4><h4>&nbsp;</h4>`;
}

function initBoards() {
  const start = document.getElementById('start');
  const boards = document.getElementById('boards');
  const select = document.getElementById('select');
  const comlist = document.getElementById('com-list');
  const rule = document.getElementById('pri-rule-explanation');
  const ruleButton = document.getElementById('rule-button');
  if (DEBUG) {
    document.getElementById('game-title').innerHTML = "DEBUG MODE";
  }
  start.style.display = 'none';
  rule.style.display = 'none';
  ruleButton.style.display = 'block';
  boards.style.display = 'block';
  select.style.display = 'block';
  comlist.style.display = 'block';
  bgmButton.style.display = 'block';
  message.innerHTML = '　'; //１行確保するために空白を入れておく
  setBgm(defaultBgm);
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
  await wait(500);
  displayDialog(com.getDialogAtRandom(com.greetings));
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
  bgm.pause();
  setBgm(approachingSound);
  bgm.play();
  await appearMessage(com.approaching, 800, approachingSound.duration * 1000, false, spMessage)
  bgm.pause();
  setBgm(secretBossBgm)
  bgm.play();
  await wait(500);
  displayCom(com);
  muteki.remove();
}

function displayCom(com) {
  comName.innerHTML = com.name;
  comFace.src = com.face;
  displayLifeGauge(com);
  comIcons[stage - 1].src = com.icon;
}


async function appearMessage(messageImg, animationDuration, duration, parmanent, target){
  target.innerHTML = `<img class="img-fluid" src=${messageImg}>`;
  target.animate([
    {opacity: 0},
    {opacity: 1}
  ],
  {
    duration: animationDuration,
    fill: 'forwards'
  });
  await wait(duration);
  if (!parmanent) {
    target.animate([
      {opacity: 1},
      {opacity: 0}
    ],
    {
      duration: animationDuration,
      fill: 'forwards'
    });
  }
  await wait(animationDuration);
  target.innerHTML = ``;
}

function resetBord(){
  resetDialog("com");
  resetDialog("player");
  playerSelect.innerHTML = '';
  compSelect.innerHTML = '';
  playerSelect.style.color = '';
  compSelect.style.color = '';
  comName.innerHTML = '？？？';
  comFace.src = `${ASSET_PATH}/question.jpg`;
  cLife.innerHTML = '';
  initComLifeGauge();
  if (player.isAwakening) {
    awakenOff();
  }
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

function setBgm(newBgm) {
  bgm = newBgm;
  //ミュートモードから再度BGMを流す際に、defaultVolumeが必要になる
  bgm.volumeConf = newBgm.volumeConf;
  if (muteMode) {
    bgm.volume = 0;
  } else {
    bgm.volume = newBgm.volumeConf;
  }
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
const caution = document.getElementById('caution');

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
    bgm.volume = bgm.volumeConf;
    bgmButton.src = `${ASSET_PATH}icon-music-stop.png`;
    muteMode = false;
  } else {
    bgm.volume = 0;
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
    hasAwakenInStage = false;
    while(!endStage()){
      resetSelectionDisplay();
      if (!hasAwakenInStage && player.canAwaken()) {
        // 覚醒の発動確率＝2/5
        switch (getRandomInt0to(DEBUG ? 0 : 4)) {
          case 0:
          case 1:
            awakenOn();
        }
      }
      
      player.selection = await Promise.any([selectRock(), selectPaper(), selectScissors(), selectMuteki()]);
      if (player.selection == MUTEKI) {
        awakenOff();
      } else {
        goSecretBoss = false;
      }
      displaySelection(player);
      com.selectHand();
      displaySelection(com);
      message.innerHTML += 'ぽんっ！';
      await wait(1000);
      let result = playRound(player, com);
      displaySelectionsBy(result);
      message.innerText = result;
      //スーバー覚醒なら相手に２〜４倍のダメージ
      if (player.isSuperAwakening && result == PLAYER_WIN) {
        for (let i = 0; i < 2 + getRandomInt0to(2); i++) {
          if (i != 0) {
            await wait(500);
          }
          reduceLifeGuageBy(result);
        }
        //覚醒なら相手に２倍ダメージ, 
      } else if (player.isAwakening && result == PLAYER_WIN) {
        displayDialog(player.getDialogAtRandom(player.inspiringDialogs),"player");
        reduceLifeGuageBy(result);
        await wait(500);
        reduceLifeGuageBy(result);
      } else {
        //通常ダメージ
        reduceLifeGuageBy(result);
      }
      switch (result) {
        case PLAYER_WIN:
          displayDialog(com.getRandomLoseDialog());
          break;
        case COM_WIN:
          displayDialog(com.getDialogAtRandom(com.winDialogs));
          break;
      }
      await wait(2000);
      if(stage == coms.length && player.life <= 0 && !player.isSuperAwakening && !(com instanceof SecretBoss)) {
        await player.superAwaken();
      } 
    }
    if (player.life > 0) {
      comIcons[stage - 1].src = com.defeatedIcon;
    } else {
      playerFace.src = player.defeatedFace;
      await wait(1000);
    }
    whoWon();
    stage++;
  }
  if (player.life > 0) {
    await appearMessage(THANKS_IMG, 500, 10000, true, spMessage);
  }
  reload();
}