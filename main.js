const gameTable = document.querySelector('.game-table');
const p1TextInput = document.querySelector('.p1input');
const p2TextInput = document.querySelector('.p2input');
const playersElements = document.querySelectorAll('.container');
const gameNotesText = document.getElementById('game-notes');
const gameOverTextWinner = document.getElementById('game-notes-modal-winner');
const gameOverTextLoser = document.getElementById('game-notes-modal-loser');
const modal = document.getElementById("myModal");
const countdownElement = document.getElementById("countdown");
let p1Score = 0;
let p2Score = 0;
let flagEmptyP1 = [];
let flagEmptyP2 = [];
let round = 0;
let gameOver = false;
const tableData = [];
let playsAgain = false;
let playerOneIsPlaying = true;

const createTable = () => {
  for (let i = 0; i < 12; i++) {
    const point = {
      id: i,
      seeds: 3
    };

    tableData.push(point);
  }

  for (let i = 0; i < 6; i++) {
    tableData[i].matcher = i + 6;
  }

  for (let i = 6; i < 12; i++) {
    tableData[i].matcher = i - 6;
  }

  gameNotesText.value = 'Game table created! Player 1, starts playing!'
}

const setupInitialTable = () => {
  for (let i = 1; i < 7; i++) {
    playersElements[0].children[i].innerHTML = tableData[i].seeds;
  }

  for (let i = 1; i < 7; i++) {
    playersElements[1].children[i].innerHTML = tableData[i].seeds;
  }
}

const updateUI = () => {
  for (let i = 1; i < 7; i++) {
    playersElements[0].children[i].innerHTML = tableData[i - 1].seeds;
    playersElements[1].children[i].innerHTML = tableData[i + 5].seeds;
  }
}

const setPlayerTurn = (roundNumber) => {

  if (roundNumber % 2) {
    playerOneIsPlaying = false;
  } else {
    playerOneIsPlaying = true;
  }

  lockOppositePlayerPits(playerOneIsPlaying);
}

const lockOppositePlayerPits = (playerOneIsPlaying) => {
  if (playerOneIsPlaying) {
    for (let i = 1; i < 7; i++) {
      playersElements[0].children[i].removeAttribute('disabled');
    }
    for (let i = 1; i < 7; i++) {
      playersElements[1].children[i].setAttribute('disabled', '');
    }
  } else {
    for (let i = 1; i < 7; i++) {
      playersElements[1].children[i].removeAttribute('disabled');
    }
    for (let i = 1; i < 7; i++) {
      playersElements[0].children[i].setAttribute('disabled', '');
    }
  }
}

const checkGameOver = () => {
  for (let i = 0; i < 6; i++) {
    if (tableData[i].seeds !== 0) {
      flagEmptyP1[i] = false
    } else {
      flagEmptyP1[i] = true
    }
  }

  for (let i = 0; i < 6; i++) {
    if (tableData[i + 6].seeds !== 0) {
      flagEmptyP2[i] = false
    } else {
      flagEmptyP2[i] = true
    }
  }

  const filteredFlagsP1 = flagEmptyP1.filter(flag => flag === false);
  const filteredFlagsP2 = flagEmptyP2.filter(flag => flag === false);

  if (filteredFlagsP1.length === 0 || filteredFlagsP2.length === 0) {
    gameOver = true
  }
}

const updatePlayer1Score = (points) => {
  p1Score += points;
  p1TextInput.value = p1Score;
  gameNotesText.value = `Player 1 scored +${points} points. Player 2 turn.`;
}

const updatePlayer2Score = (points) => {
  p2Score += points;
  p2TextInput.value = p2Score;
  gameNotesText.value = `Player 2 scored +${points} points. Player 1 turn.`;
}

const checkAndSetPlayerScores = (playerOneTurn, selectedPitId, seedsOnSelectedPit) => {
  if (playerOneTurn && (seedsOnSelectedPit > selectedPitId)) {
    updatePlayer1Score(1);
  }

  if (!playerOneTurn && (selectedPitId + seedsOnSelectedPit > 11)) {
    updatePlayer2Score(1);
  }
}

const checkAndSetSeedsToPits = (playerOneTurn, selectedPitId, seedsOnSelectedPit) => {
  if (playerOneTurn) {
    const seedsRest = seedsOnSelectedPit - (selectedPitId + 1);

    if (seedsRest >= 0 && seedsRest <= 6) {
      for (let i = 0; i < selectedPitId; i++) {
        tableData[i].seeds++;
      }

      for (let i = 0; i < seedsRest; i++) {
        tableData[i + 6].seeds++;
      }

      if (seedsRest === 0) {
        gameNotesText.value = `Player 1 plays another round!`;
        round--;
      }
    } else if (seedsRest > 6) {
      for (let i = 0; i < seedsRest; i++) {
        tableData[6 + i].seeds++;
      }
    } else {
      let lastPostion = 0;
      for (let i = 0; i < seedsOnSelectedPit; i++) {
        selectedPitId--;
        lastPostion = selectedPitId;
        if (tableData[lastPostion].seeds === 0) break;
        tableData[selectedPitId].seeds++;
      }

      checkIfEndedInFrontOfEmptyPit(playerOneTurn, lastPostion);
    }
  } else {
    const seedsRest = (selectedPitId + seedsOnSelectedPit) - 12;

    if (seedsRest >= 0 && seedsRest <= 6) {
      for (let i = 0; i < (seedsOnSelectedPit - (seedsRest + 1)); i++) {
        tableData[i + (selectedPitId + 1)].seeds++;
      }

      for (let i = 0; i < seedsRest; i++) {
        tableData[5 - i].seeds++;
      }

      if (seedsRest === 0) {
        gameNotesText.value = `Player 2 plays another round!`;
        round--;
      }
    } else if (seedsRest > 6) {
      for (let i = 0; i < seedsRest; i++) {
        tableData[5 - i].seeds++;
      }
    } else {
      let lastPostion = selectedPitId + seedsOnSelectedPit;
      if (tableData[lastPostion].seeds === 0) {
        for (let i = 0; i < (seedsOnSelectedPit - 1); i++) {
          selectedPitId++;
          tableData[selectedPitId].seeds++;
        }
      } else {
        for (let i = 0; i < seedsOnSelectedPit; i++) {
          selectedPitId++;
          tableData[selectedPitId].seeds++;
        }
      }

      checkIfEndedInFrontOfEmptyPit(playerOneTurn, lastPostion);
    }
  }

  checkGameOver();
  if (gameOver) {
    const win = (p1Score > p2Score) ? `Player 1 wins with ${p1Score} points.` : `Player 2 wins with ${p2Score} points.`
    const lost = (p1Score > p2Score) ? `Player 2 finished with ${p2Score} points.` : `Player 1 finished with ${p1Score} points.`
    gameNotesText.value = `Game ended. ${win} ${lost}`;

    gameOverTextWinner.value = win;
    gameOverTextLoser.value = lost;

    modal.style.display = "block";

    startCountdown(5);

    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }
}

const checkIfEndedInFrontOfEmptyPit = (playerOneTurn, endId) => {
  const matcherElementId = tableData[endId].matcher;
  let points = 0;

  if (tableData[endId].seeds === 0) {
    points = tableData[matcherElementId].seeds + 1;

    playerOneTurn ? updatePlayer1Score(points) : updatePlayer2Score(points);

    tableData[endId].seeds = 0;
    tableData[matcherElementId].seeds = 0;
  }
}

createTable();

setupInitialTable();

setPlayerTurn(round);

const getClick = (e) => {

  round++

  const selectedPitId = parseInt(e.target.id.split('n')[1]);

  const seedsOnSelectedPit = tableData[selectedPitId].seeds;

  tableData[selectedPitId].seeds = 0;

  checkAndSetPlayerScores(playerOneIsPlaying, selectedPitId, seedsOnSelectedPit);

  checkAndSetSeedsToPits(playerOneIsPlaying, selectedPitId, seedsOnSelectedPit);

  updateUI();

  setPlayerTurn(round);
}

gameTable.addEventListener('click', getClick);

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

const startCountdown = (duration) => {
  let timer = duration;
  countdownElement.innerHTML = timer;

  const interval = setInterval(function () {
    timer--;
    countdownElement.innerHTML = timer;

    if (timer <= 0) {
      clearInterval(interval);
      countdownElement.innerHTML = "Countdown Finished, Restarting!";
    }
  }, 1000);
}