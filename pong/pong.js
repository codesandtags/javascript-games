import "./style.css";

const app = document.querySelector("#app");
let game = {};

// Game constants
const WIDTH = 400;
const HEIGHT = 500;
const MIDDLE = HEIGHT / 2;
const SCREEN_WIDTH = window.screen.width;
const CANVAS_POSITION = SCREEN_WIDTH / 2 - WIDTH / 2;
const IS_MOBILE = window.matchMedia("(max-width: 600px)");
const WINNING_SCORE = 5;
const FONT_SCORE = "32px Courier New";

// Ball
const BALL_RADIUS = 5;
const BALL_COLOR = "#00FCFF";

// Paddle
const PADDLE_HEIGHT = 8;
const PADDLE_WIDTH = 45;
const PADDLE_DIFFERENCE = 20;
const PADDLE_COLOR = "white";

let playerScore = 0;
let computerScore = 0;

let isNewGame = true;
let isGameOver = true;

const renderPaddle = (context, type) => {
   context.fillStyle = PADDLE_COLOR;
   const { paddleBottom, paddleTop } = game;

   if (type === "top") {
      context.fillRect(paddleTop.X, paddleTop.Y, PADDLE_WIDTH, PADDLE_HEIGHT);
   } else if (type === "bottom") {
      context.fillRect(
         paddleBottom.X,
         paddleBottom.Y,
         PADDLE_WIDTH,
         PADDLE_HEIGHT
      );
   }
};

const renderMiddleLine = (context) => {
   context.beginPath();
   context.setLineDash([5]);
   context.moveTo(0, MIDDLE);
   context.lineTo(WIDTH, MIDDLE);
   context.strokeStyle = "grey";
   context.stroke();
};

const renderScore = (context) => {
   context.font = FONT_SCORE;
   const SCORE_X = 20;
   const PLAYER_SCORE_Y = MIDDLE + 50;
   const COMPUTER_SCORE_Y = MIDDLE - 30;

   context.fillText(game.score.player, SCORE_X, PLAYER_SCORE_Y);
   context.fillText(game.score.computer, SCORE_X, COMPUTER_SCORE_Y);
};

const renderBoard = (canvas) => {
   const context = canvas.getContext("2d");

   if (context) {
      context.fillStyle = "rgb(20,20,20)";
      context.fillRect(0, 0, WIDTH, HEIGHT);

      renderPaddle(context, "top");
      renderPaddle(context, "bottom");
      renderMiddleLine(context);
      renderBall(context);
      renderScore(context);
   }
};

const renderBall = (context) => {
   const { ball } = game;
   context.beginPath();
   context.arc(ball.X, ball.Y, BALL_RADIUS, 2 * Math.PI, false);
   context.fillStyle = BALL_COLOR;
   context.fill();
};

const createCanvas = () => {
   const canvas = document.createElement("canvas");
   canvas.id = "pong";
   canvas.width = WIDTH;
   canvas.height = HEIGHT;
   canvas.classList.add("board");
   app.appendChild(canvas);

   return canvas;
};

const createLayout = () => {
   app.innerHTML = `
        <h1>Pong 🏓</h1>
    `;
};

const ballReset = () => {
   const ball = game.ball;
   ball.X = WIDTH / 2;
   ball.Y = HEIGHT / 2;
   ball.speedY = -3;
   ball.speedX = -2;
   ball.paddleContact = false;
};

const ballMove = () => {
   const { ball } = game;
   ball.Y += -ball.speedY;

   if (ball.playerMoved && ball.paddleContact) {
      ball.X += ball.speedX;
   }
};

const bounceOffLeftWall = (ball) => {
   if (ball.X < 0 && ball.speedX < 0) {
      console.log("🏓💥 Ball hit LEFT wall");
      ball.speedX = -ball.speedX;
   }
};

const bounceOffRightWall = (ball) => {
   if (ball.X > WIDTH && ball.speedX > 0) {
      console.log("🏓💥 Ball hit RIGHT wall");
      ball.speedX = -ball.speedX;
   }
};

const bounceOffPaddleBottom = (ball, paddleBottom) => {
   if (ball.Y > HEIGHT - PADDLE_DIFFERENCE) {
      if (ball.X > paddleBottom.X && ball.X < paddleBottom.X + PADDLE_WIDTH) {
         ball.paddleContact = true;

         if (ball.playerMoved) {
            ball.speedY -= 1;
            if (ball.speedY < -5) {
               ball.speedY = -5;
            }
         }
         ball.speedY = -ball.speedY;
         ball.trajectoryX = ball.X - (paddleBottom.X + PADDLE_DIFFERENCE);
         ball.speedX = ball.trajectoryX * 0.3;
      } else {
         ballReset();
         addScore("player");
      }
   }
};

const bounceOffPaddleTop = (ball, paddleTop) => {
   if (ball.Y < PADDLE_DIFFERENCE) {
      if (ball.X > paddleTop.X && ball.X < paddleTop.X + PADDLE_WIDTH) {
         ball.paddleContact = true;
         ball.speedY = -ball.speedY;
      } else {
         ballReset();
         addScore("computer");
      }
   }
};

const addScore = (player) => {
   if (player === "player") {
      game.score.player++;
   } else if (player === "computer") {
      game.score.computer++;
   }
};

const checkBallCollision = () => {
   const { ball, paddleBottom, paddleTop } = game;

   bounceOffLeftWall(ball);
   bounceOffRightWall(ball);
   bounceOffPaddleBottom(ball, paddleBottom);
   bounceOffPaddleTop(ball, paddleTop);
};

const computerAIMovement = () => {
   const { ball, paddleTop, computerSpeed } = game;
   if (paddleTop.X + PADDLE_DIFFERENCE < ball.X) {
      paddleTop.X += computerSpeed;
   } else {
      paddleTop.X -= computerSpeed;
   }
};

const animate = () => {
   const canvas = document.querySelector("#pong");
   renderBoard(canvas);
   ballMove();
   checkBallCollision();
   computerAIMovement();
   window.requestAnimationFrame(animate);
   console.table({
      ball: game.ball,
   });
};

const onPaddleMove = (event) => {
   const { paddleBottom } = game;

   paddleBottom.X = event.clientX - CANVAS_POSITION - PADDLE_DIFFERENCE;

   if (paddleBottom.X < PADDLE_DIFFERENCE) {
      paddleBottom.X = 0;
   }
   if (paddleBottom.X > WIDTH - PADDLE_WIDTH) {
      paddleBottom.X = WIDTH - PADDLE_WIDTH;
   }
};

const addListeners = () => {
   const canvas = document.querySelector("#pong");

   canvas.addEventListener("mousemove", onPaddleMove);
};

const initializeGameValues = () => {
   game = {
      isNewGame: false,
      isGameOver: false,
      computerSpeed: 5,
      score: {
         player: 0,
         computer: 0,
      },
      paddleTop: {
         X: 255,
         Y: 10,
      },
      paddleBottom: {
         X: 255,
         Y: HEIGHT - 20,
      },
      ball: {
         speedX: 0,
         speedY: 0,
         X: 0,
         Y: 0,
         trajectoryX: 0,
         paddleContact: false,
         playerMoved: true,
      },
   };
   ballReset();
};

const startGame = () => {
   initializeGameValues();
   createLayout();
   createCanvas();
   animate();
   // setInterval(animate, 300);
   addListeners();
};

const gameOver = () => {};

window.onload = startGame;
