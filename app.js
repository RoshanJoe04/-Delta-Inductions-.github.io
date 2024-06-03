const gameboard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#player");
const infoDisplay = document.querySelector("#info-display");
const width = 8;
let selectedPiece = null;
let isPaused = false;
document.getElementById('RotateClockwise').addEventListener('click', rotateClockwise);
document.getElementById('RotateAnticlockwise').addEventListener('click', rotateAnticlockwise);
document.getElementById('Resetgame').addEventListener('click', resetGame);
document.getElementById('play_pause').addEventListener('click', play_pause);
const startPieces = ['', '', 'redCannon', 'redTitan', '', '', '', '',
                     '', '', '', '', 'redSemiRicochet', 'redRicochet', '', '',
                     '', '', '', '', '', 'redTank', '', '',
                     '', '', '', '', '', '', '', '',
                     '', '', '', '', '', '', '', '',
                     '', 'blueTank', '', '', '', '', '', '',
                     '', '', '', '', '', '', '', '',
                     'blueSemiRicochet', 'blueRicochet', '', '', 'blueTitan', 'blueCannon', '', '',
];
let currentPlayer = 'blue';
let redPlayerTime = 300; // 5 minutes in seconds
let bluePlayerTime = 300; // 5 minutes in seconds
let timerInterval;
function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = pieceToHtml[startPiece] || '';
        square.setAttribute('square-id', i);
        gameboard.append(square);
    });
}
createBoard();
startTimer();
let ricochets = document.querySelectorAll('[id*="ricochet"], [id*="semi"]');
ricochets.forEach(ricochet => {
    ricochet.setAttribute('angle', 0);
});
const allsquares = document.querySelectorAll("#gameboard .square");
allsquares.forEach(square => {
square.addEventListener('click', clickablepieces);
});
let startpositionid;
function clickablepieces(e) {
    if(!e.target.classList.contains(currentPlayer)){
        return;
     }
    let clickedPiece = e.target;
    if (clickedPiece.id.includes('ricochet') && clickedPiece.classList.contains(currentPlayer)){
        selectedPiece = clickedPiece;
    }
    // Clear possible moves from previous click
        if(!e.target.classList.contains(currentPlayer)) {
            return;
        }
        if (clickedPiece.id.includes('ricochet') && clickedPiece.classList.contains(currentPlayer)) { 
            selectedPiece = clickedPiece;
        }
        // Clear possible moves from previous click
        if  (!e.target.classList.contains('possible-move') ) {
            allsquares.forEach(square => {
                square.classList.remove('possible-move');
                square.removeEventListener('click', movePiece);
            });
    
            startpositionid = Number(e.target.parentElement.getAttribute('square-id'));
        
    }
         if (e.target.innerHTML !== '' && e.target.innerHTML != 'Cannon') {
            const row = Math.floor(startpositionid / 8) + 1;
            const col = (startpositionid % 8) + 1;
            const possibleMoveIds = [];
         
            for (let id = 0; id <= 63; id++) {
                const moveRow = Math.floor(id / 8) + 1;
                const moveCol = (id % 8) + 1;
                const square = document.querySelector(`[square-id="${id}"]`);

                if (Math.abs(row - moveRow) <= 1 && Math.abs(col - moveCol) <= 1 && square.innerHTML === '') {
                    possibleMoveIds.push(id);
                }
            }

            possibleMoveIds.forEach(id => {
                const possible_moves = document.querySelector(`[square-id="${id}"]`);
                if (possible_moves) {
                    possible_moves.classList.add('possible-move');
                    possible_moves.addEventListener('click', movePiece);
                }
            });
        } else if (e.target.innerHTML == 'Cannon') {
            const row = Math.floor(startpositionid / 8) + 1;
            const col = (startpositionid % 8) + 1;
            const possibleMoveIds = [];

            for (let id = 0; id <= 63; id++) {
                const moveRow = Math.floor(id / 8) + 1;
                const moveCol = (id % 8) + 1;
                const square = document.querySelector(`[square-id="${id}"]`);

                if (row == moveRow && Math.abs(col - moveCol) <= 1 && square.innerHTML === '') {
                    possibleMoveIds.push(id);
                }
            }

            possibleMoveIds.forEach(id => {
                const possible_moves = document.querySelector(`[square-id="${id}"]`);
                if (possible_moves) {
                    possible_moves.classList.add('possible-move');
                    possible_moves.addEventListener('click', movePiece);
                }
            });
        }
    }

function movePiece(e) {
    const clickedSquare = e.target;

    if (clickedSquare.classList.contains('possible-move')) {
        const piece = document.querySelector(`[square-id="${startpositionid}"]`).innerHTML;

        clickedSquare.innerHTML = piece;

        document.querySelector(`[square-id="${startpositionid}"]`).innerHTML = '';

        const squares = document.querySelectorAll('.possible-move');
        squares.forEach(square => {
            square.classList.remove('possible-move');
            square.removeEventListener('click', movePiece);
        });
        shootBullet();
        currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
        if (selectedPiece) {
            selectedPiece.style.transform = 'none';
            selectedPiece = null;
        }  
    }
}
function shootBullet() {
    // Get the current player's cannon
    const cannon = currentPlayer === 'red' ? document.querySelector('#redCannon') : document.querySelector('#blueCannon');
    let bulletpos = Number(cannon.parentElement.getAttribute('square-id'));
    const firingPlayer = currentPlayer;

let direction;
firingPlayer === 'red' ? direction = 'down' : direction ='up'
let bullet = document.createElement('div');
bullet.classList.add('bullet');
function bulletmovement() {
    // Update the bullet position based on the direction
    if (direction === 'up') bulletpos -= 8;
    if (direction === 'down') bulletpos += 8;
    if (direction === 'right') bulletpos += 1;
    if (direction === 'left') bulletpos -= 1;
    const nextSquare = document.querySelector(`[square-id="${bulletpos}"]`);
    const oppositePlayer = firingPlayer === 'red' ? 'blue' : 'red';
    if (bulletpos < 0 || bulletpos >= 64 ||nextSquare.querySelector('.cannon') ||nextSquare.querySelector(`.titan.${firingPlayer}`)||bulletpos % 8 == 0 && direction == 'left'||bulletpos % 7 == 0 && direction == 'right')
        {
            bullet.remove();
            return;
        }
        console.log(nextSquare);
        if (nextSquare.querySelector('.ricochet'))
        {
            let angle = nextSquare.querySelector('.ricochet').getAttribute('angle');
            if(angle%180==0)
                {
                    if (direction === 'up') direction='left';
                    else if (direction === 'down') direction='right';
                    else if (direction === 'left') direction='up';
                    else if (direction === 'right') direction='down';
                }
                else{
                    if (direction === 'down') direction='left';
                    else if (direction === 'up') direction='right';
                    else if (direction === 'right') direction='up';
                    else if (direction === 'left') direction='down';
                }
        }
        if (nextSquare.querySelector('.semiricochet'))
            {
             let angle = nextSquare.querySelector('.semiricochet').getAttribute('angle');
             if(angle%360==0)
                {
                    if (direction === 'up') direction='left';
                    else if (direction === 'right') direction='down';
                    else if (direction === 'down') 
                    {
                     bullet.remove();
                     return;
                    }
                    else if (direction === 'left') 
                        {
                            bullet.remove();
                            return;
                           }
                } 
                else if ((angle - 90) % 360 == 0)
                    {
                        if (direction === 'down') direction='left';
                    else if (direction === 'right') direction='up';
                    else if (direction === 'up') 
                    {
                     bullet.remove();
                     return;
                    }
                    else if (direction === 'left') 
                        {
                            bullet.remove();
                            return;
                           }
                    } 
                   else if ((angle - 180) % 360 == 0)
                    {
                        if (direction === 'down') direction='right';
                    else if (direction === 'left') direction='up';
                    else if (direction === 'up') 
                    {
                     bullet.remove();
                     return;
                    }
                    else if (direction === 'right') 
                        {
                            bullet.remove();
                            return;
                           }
                    } 
                   else if ((angle - 270) % 360 == 0)
                    {
                        if (direction === 'left') direction='down';
                    else if (direction === 'up') direction='right';
                    else if (direction === 'down') 
                    {
                     bullet.remove();
                     return;
                    }
                    else if (direction === 'right') 
                        {
                            bullet.remove();
                            return;
                           }
                    } 
            }
    
    if (nextSquare.firstChild) {
        nextSquare.firstChild.appendChild(bullet);
    } else {
        nextSquare.appendChild(bullet);
    }
    setTimeout(bulletmovement, 100); 
       if (bulletpos >= 0 && bulletpos < 64 && nextSquare.querySelector(`.titan.${oppositePlayer}`)) {
        alert("Game Over " + firingPlayer + " wins");
        bullet.remove();
        resetGame();
    }
    
}

// Start moving the bullet
bulletmovement();
}


function startTimer() {
    timerInterval = setInterval(function() {
        if (currentPlayer === 'red') {
            redPlayerTime--;
            if (redPlayerTime <= 0) {
                alert("Game Over: Blue player wins");
                resetGame();
            }
        } else {
            bluePlayerTime--;
            if (bluePlayerTime <= 0) {
                alert("Game Over: Red player wins");
                resetGame();
            }
        }
        document.getElementById('red-timer').textContent = formatTime(redPlayerTime);
        document.getElementById('blue-timer').textContent = formatTime(bluePlayerTime);
    }, 1000);
}

function formatTime(timeInSeconds) {
    let minutes = Math.floor(timeInSeconds / 60);
    let seconds = timeInSeconds % 60;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetGame() {
    // Reset the game state
    currentPlayer = 'blue';
    redPlayerTime = 300;
    bluePlayerTime = 300;
    startPieces.forEach((startPiece, i) => {
        const square = document.querySelector(`[square-id="${i}"]`);
        square.innerHTML = pieceToHtml[startPiece] || '';
    });
    // Clear possible moves and event listeners
    allsquares.forEach(square => {
        square.classList.remove('possible-move');
        square.removeEventListener('click', movePiece);
    });
    // Reset the timer
    stopTimer();
    startTimer();
}
function rotateClockwise() {
    if (selectedPiece && selectedPiece.id.includes('ricochet')) {
        angle=Number(selectedPiece.getAttribute('angle'))
        angle+=90;
        selectedPiece.style.transform = `rotateZ(${angle}deg`;
        selectedPiece.setAttribute('angle', angle);
            allsquares.forEach(square => {
            square.classList.remove('possible-move');
            square.removeEventListener('click', movePiece);
        });
        selectedPiece = null;
        shootBullet();
        currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    }
}

function rotateAnticlockwise() {
    if (selectedPiece && selectedPiece.id.includes('ricochet')) {
        angle=Number(selectedPiece.getAttribute('angle'))
        angle+=270;
        selectedPiece.style.transform = `rotateZ(${angle}deg`;
        selectedPiece.setAttribute('angle', angle);       
        allsquares.forEach(square => {
            square.classList.remove('possible-move');
            square.removeEventListener('click', movePiece);
        });
        selectedPiece = null;
        shootBullet(); 
        currentPlayer = currentPlayer === 'red' ? 'blue' : 'red';
    }
}
document.getElementById('play_pause').addEventListener('click', function() {
    isPaused = !isPaused;
    if (isPaused) {
        stopTimer(); 
        allsquares.forEach(square => {
            square.removeEventListener('click', clickablepieces);
            });  
             
    }
    else {
        startTimer();
        allsquares.forEach(square => {
            square.addEventListener('click', clickablepieces);
            });
        }
    });