const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('start-button');
const livesSpan = document.getElementById('lives');
const scoreSpan = document.getElementById('score');

let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;
let gameWon = false;
let rightPressed = false;
let leftPressed = false;

const ball = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    radius: 10,
    dx: 2,
    dy: -2,
    speed: 4
};

const paddle = {
    height: 10,
    width: 75,
    x: (canvas.width - 75) / 2,
    dx: 5
};

const brick = {
    rowCount: 3,
    columnCount: 5,
    width: 75,
    height: 20,
    padding: 10,
    offsetTop: 30,
    offsetLeft: 30
};

let bricks = [];

const brickBreakSound = new Audio('https://www.soundjay.com/button/sounds/button-7.mp3');
const paddleHitSound = new Audio('https://www.soundjay.com/button/sounds/button-6.mp3');
const wallHitSound = new Audio('https://www.soundjay.com/button/sounds/button-9.mp3');

function initBricks() {
    bricks = [];
    for (let c = 0; c < brick.columnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brick.rowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
startButton.addEventListener('click', startGame, false);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function collisionDetection() {
    for (let c = 0; c < brick.columnCount; c++) {
        for (let r = 0; r < brick.rowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (
                    ball.x > b.x &&
                    ball.x < b.x + brick.width &&
                    ball.y > b.y &&
                    ball.y < b.y + brick.height
                ) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    scoreSpan.textContent = score;
                    brickBreakSound.play();
                    if (score === brick.rowCount * brick.columnCount * level) {
                        levelUp();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brick.columnCount; c++) {
        for (let r = 0; r < brick.rowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brick.width + brick.padding) + brick.offsetLeft;
                const brickY = r * (brick.height + brick.padding) + brick.offsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brick.width, brick.height);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function draw() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
        wallHitSound.play();
    }
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
        wallHitSound.play();
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
            paddleHitSound.play();
        } else {
            lives--;
            livesSpan.textContent = lives;
            if (!lives) {
                gameOver = true;
                alert('GAME OVER');
                document.location.reload();
            } else {
                ball.x = canvas.width / 2;
                ball.y = canvas.height - 30;
                ball.dx = 2 * (Math.random() > 0.5 ? 1 : -1);
                ball.dy = -2;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        }
    }

    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.dx;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw);
}

function levelUp() {
    level++;
    alert(`LEVEL ${level}!`);
    ball.speed += 0.5;
    ball.dx = (ball.dx / Math.abs(ball.dx)) * (Math.abs(ball.dx) + 0.5);
    ball.dy = (ball.dy / Math.abs(ball.dy)) * (Math.abs(ball.dy) + 0.5);
    initBricks();
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    paddle.x = (canvas.width - paddle.width) / 2;
}

function startGame() {
    startButton.style.display = 'none';
    initBricks();
    draw();
}
