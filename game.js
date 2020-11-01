const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 100;
const paddleMarginBottom = 50;
const paddleHeight = 20;
const ballRadius = 8;

let life = 5;
let score = 0;
const scoreUnit = 10;
let level = 1;
const maxLevel = 3;
let gameOver = false;
let leftArrow = false;
let rightArrow = false;
let paused = false;

let bricks = [];
let ballColour = ["#9400D3","#4B0082","#0000FF","#00FF00","#FFFF00","#FF7F00","#FF0000"];

const LEVEL_IMG = new Image();
LEVEL_IMG.src = "images/level.png";

const LIFE_IMG = new Image();
LIFE_IMG.src = "images/life.png";

const SCORE_IMG = new Image();
SCORE_IMG.src = "images/score.png";

const WALL_HIT = new Audio();
WALL_HIT.src = "sounds/wall.mp3";

const LIFE_LOST = new Audio();
LIFE_LOST.src = "sounds/life_lost.mp3";

const PADDLE_HIT = new Audio();
PADDLE_HIT.src = "sounds/paddle_hit.mp3";

const WIN = new Audio();
WIN.src = "sounds/win.mp3";

const BRICK_HIT = new Audio();
BRICK_HIT.src = "sounds/brick_hit.mp3";

const paddle = {
    x : canvas.width/2 - paddleWidth/2,
    y : canvas.height - paddleMarginBottom - paddleHeight,
    width : paddleWidth,
    height : paddleHeight,
    dx : 5
}

const ball = {
    x : canvas.width/2,
    y : paddle.y - ballRadius,
    radius : ballRadius,
    speed : 4,
    dx : 3 * (Math.random() * 2 - 1),
    dy : -3,
    colour : "#ffcd05"
}

const brick = {
    row : 3,
    column : 11,
    width : 55,
    height : 20,
    offSetLeft : 30,
    offSetTop : 20,
    marginTop : 40,
}

const gameover = document.getElementById("gameover");
const youwon = document.getElementById("youwon");
const youlose = document.getElementById("youlose");
const restart = document.getElementById("restart");

document.getElementById("sound").addEventListener("click", audioManager);
document.getElementById("pause").addEventListener("click", pause);
document.getElementById("play").addEventListener("click", play);
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
restart.addEventListener("click", function(){
    location.reload();
});

function pause()
{
    if (!paused)
        paused = true;

}
function play()
{
    if(paused){
        paused = false;
        loop();
    }
}

function getName() {
    const idx = document.URL.indexOf('=');
    return document.URL.substring(idx + 1, document.URL.length);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawPaddle(){
    ctx.fillStyle = "#ffcd05";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    ctx.strokeStyle = "#2e3548";
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function keyDownHandler(event) {
    if(event.key === 'ArrowLeft'){
        leftArrow = true;
    }
    else if(event.key === 'ArrowRight'){
        rightArrow = true;
    }
}

function keyUpHandler(event) {
    if(event.key === 'ArrowLeft'){
        leftArrow = false;
    }
    else if(event.key === 'ArrowRight'){
        rightArrow = false;
    }
}

function movePaddle(){
    if(rightArrow && paddle.x + paddle.width < canvas.width){
        paddle.x += paddle.dx;
    }else if(leftArrow && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

function drawBall(){
    ctx.beginPath();
    
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = ball.colour;
    ctx.fill();

    ctx.strokeStyle = "#2e3548";
    ctx.stroke();
    
    ctx.closePath();
}

function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballWallCollision(){
    if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
        WALL_HIT.play();
    }
    
    if(ball.y - ball.radius < 0){
        ball.dy = -ball.dy;
        WALL_HIT.play();
    }
    
    if(ball.y + ball.radius > canvas.height){
        life--;
        LIFE_LOST.play();
        resetBall();
    }

}

function ballPaddleCollision(){
    if(ball.x < paddle.x + paddle.width && ball.x > paddle.x && paddle.y < paddle.y + paddle.height && ball.y > paddle.y){

        PADDLE_HIT.play();

        let collidePoint = ball.x - (paddle.x + paddle.width/2);

        collidePoint = collidePoint / (paddle.width/2);

        let angle = collidePoint * Math.PI/3;

        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
        ball.colour = ballColour[getRandomInt(0,7)];
        document.getElementById("body").style.background = ball.colour;
    }
}

function resetBall(){
    ball.x = canvas.width/2;
    ball.y = paddle.y - ballRadius;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
    ball.colour = ballColour[getRandomInt(0,7)];
    document.getElementById("body").style.background = ball.colour;
}

function createBricks(){
    for(let r = 0; r < brick.row; r++){
        bricks[r] = [];
        for(let c = 0; c < brick.column; c++){
            bricks[r][c] = {
                x : c * ( brick.offSetLeft + brick.width ) + brick.offSetLeft,
                y : r * ( brick.offSetTop + brick.height ) + brick.offSetTop + brick.marginTop,
                status : true,
                level : 2
            }
        }
    }
}

createBricks();

function drawBricks(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];

            if(b.status && b.level === 2){
                ctx.fillStyle = "#ffcd05";
                ctx.fillRect(b.x, b.y, brick.width, brick.height);
                
                ctx.strokeStyle = "#2e3548";
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
            else if(b.status && b.level === 1){
                ctx.fillStyle = "#b89300";
                ctx.fillRect(b.x, b.y, brick.width, brick.height);

                ctx.strokeStyle = "#2e3548";
                ctx.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}

function ballBrickCollision(){
    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            let b = bricks[r][c];
            if(b.status && b.level === 2){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.level = 1;
                    score += scoreUnit;
                }
            }

            else if(b.status && b.level === 1){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    BRICK_HIT.play();
                    ball.dy = - ball.dy;
                    b.status = false;
                    b.level = 0;
                    score += scoreUnit;
                }
            }
        }
    }

}

function showGameStats(text, textX, textY, img, imgX, imgY){

    ctx.fillStyle = "#FFF";
    ctx.fillText(text, textX, textY);

    ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}

function showName(name, nameX, nameY){

    ctx.fillStyle = "#FFF";
    ctx.font = "15px Verdana";
    ctx.fillText(name,nameX,nameY);

}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    
    drawBall();
    
    drawBricks();

    showGameStats(score, 35, 25, SCORE_IMG, 5, 5);

    showGameStats(life, canvas.width - 25, 25, LIFE_IMG, canvas.width-55, 5);

    showGameStats(level, canvas.width/2, 25, LEVEL_IMG, canvas.width/2 - 30, 5);

    showName(getName(),canvas.width - 75, canvas.height - 25);
}

function gamesOver(){
    if(life <= 0){
        showYouLose();
        gameOver = true;
    }
}

function levelUp(){
    let isLevelDone = true;

    for(let r = 0; r < brick.row; r++){
        for(let c = 0; c < brick.column; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status;
        }
    }
    
    if(isLevelDone){
        WIN.play();
        
        if(level >= maxLevel){
            showYouWin();
            gameOver = true;
            return;
        }
        brick.row++;
        createBricks();
        ball.speed += 0.5;
        resetBall();
        level++;
    }
}

function update(){
    movePaddle();
    
    moveBall();
    
    ballWallCollision();
    
    ballPaddleCollision();
    
    ballBrickCollision();
    
    gamesOver();
    
    levelUp();
}

function loop(){
    draw();

    if(!paused) {
        update();

        if (!gameOver) {
            requestAnimationFrame(loop);
        }
    }
}

loop();

function audioManager(){

    let soundElement = document.getElementById("sound");
    let imgSrc = soundElement.getAttribute("src");
    let SOUND_IMG = imgSrc === "images/SOUND_ON.png" ? "images/SOUND_OFF.png" : "images/SOUND_ON.png";
    
    soundElement.setAttribute("src", SOUND_IMG);

    WALL_HIT.muted = !WALL_HIT.muted;
    PADDLE_HIT.muted = !PADDLE_HIT.muted;
    BRICK_HIT.muted = !BRICK_HIT.muted;
    WIN.muted = !WIN.muted;
    LIFE_LOST.muted = !LIFE_LOST.muted;
}

function showYouWin(){
    gameover.style.display = "block";
    youwon.style.display = "block";
}

function showYouLose(){
    gameover.style.display = "block";
    youlose.style.display = "block";
}