const playArea = document.getElementById("playArea");
const scoreValue = document.getElementById("scoreValue");
const bestScoreValue = document.getElementById("bestScoreValue");
const gameMessage = document.getElementById("gameMessage");
const gridSize = 30;
const gameSpeed = 5;

let lastRenderTime = 0;
let direction = { x: 0, y: 0 };
let pendingDirection = { x: 0, y: 0 };
let isPaused = false;
let isGameOver = false;
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore") || 0);
let snake = [{ x: 15, y: 15 }];
let food = randomFoodPosition();

updateScoreDisplay();

function gameLoop(currentTime) {
  window.requestAnimationFrame(gameLoop);
  const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
  if (secondsSinceLastRender < 1 / gameSpeed) {
    return;
  }

  lastRenderTime = currentTime;
  if (isPaused) {
    draw();
    return;
  }

  update();
  draw();
}

function update() {
  direction = pendingDirection;
  if (direction.x === 0 && direction.y === 0) {
    return;
  }

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  snake.unshift(head);

  if (positionsEqual(head, food)) {
    food = randomFoodPosition();
    score += 1;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("bestScore", String(bestScore));
    }
    updateScoreDisplay();
  } else {
    snake.pop();
  }

  if (isOutOfBounds(head) || isSelfCollision(head)) {
    showGameOver();
    return;
  }
}

function draw() {
  playArea.innerHTML = "";

  snake.forEach((segment, index) => {
    // Create a new div for each segment of the snake and position it using CSS Grid
    const segmentElement = document.createElement("div");
    segmentElement.style.gridRowStart = segment.y;
    segmentElement.style.gridColumnStart = segment.x;
    segmentElement.classList.add(index === 0 ? "head" : "bodySnake");
    playArea.appendChild(segmentElement);
  });

  // Draw food
  const foodElement = document.createElement("div");
  foodElement.style.gridRowStart = food.y;
  foodElement.style.gridColumnStart = food.x;
  foodElement.classList.add("food");
  playArea.appendChild(foodElement);
}

function randomFoodPosition() {
  let newPosition = null;
  while (
    newPosition === null ||
    snake.some((segment) => positionsEqual(segment, newPosition))
  ) {
    newPosition = {
      x: Math.floor(Math.random() * gridSize) + 1,
      y: Math.floor(Math.random() * gridSize) + 1,
    };
  }
  return newPosition;
}

function isOutOfBounds(position) {
  return (
    position.x < 1 ||
    position.x > gridSize ||
    position.y < 1 ||
    position.y > gridSize
  );
}

function isSelfCollision(head) {
  for (let i = 1; i < snake.length; i += 1) {
    if (positionsEqual(snake[i], head)) {
      return true;
    }
  }
  return false;
}

function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function resetGame() {
  snake = [{ x: 9, y: 9 }];
  direction = { x: 0, y: 0 };
  pendingDirection = { x: 0, y: 0 };
  score = 0;
  food = randomFoodPosition();
  updateScoreDisplay();
}

function showGameOver() {
  isGameOver = true;
  isPaused = true;
  gameMessage.classList.remove("hidden");
}

function clearGameOver() {
  isGameOver = false;
  gameMessage.classList.add("hidden");
}

function updateScoreDisplay() {
  scoreValue.textContent = String(score);
  bestScoreValue.textContent = String(bestScore);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    if (isGameOver) {
      clearGameOver();
      resetGame();
      isPaused = false;
      return;
    }

    isPaused = !isPaused;
    return;
  }

  const key = event.key;
  if (key === "ArrowUp" && direction.y !== 1) {
    pendingDirection = { x: 0, y: -1 };
  } else if (key === "ArrowDown" && direction.y !== -1) {
    pendingDirection = { x: 0, y: 1 };
  } else if (key === "ArrowLeft" && direction.x !== 1) {
    pendingDirection = { x: -1, y: 0 };
  } else if (key === "ArrowRight" && direction.x !== -1) {
    pendingDirection = { x: 1, y: 0 };
  }
});

window.requestAnimationFrame(gameLoop);
