let outOfBounds = false;
let gameStart = false;
let score = 0;
let finalScore = 0;
let highScores = ["100", "300", "500", "750", "1000"];
let storedScores = [];
let bSprite = "assets/snowball.png"; // sets default theme to snowy
let platImg = "assets/snow-platform.png";
let canvasBg = "assets/snow-bg.png";
let beachBg;
let snowBg;
let fireBg;
let mainSong;
let menuSong;
let speed = -1;
let snowFont; // add other fonts for score counter

function preload() {
  beachBg = loadImage("assets/beach-bg.png");
  snowBg = loadImage("assets/snow-bg.png");
  fireBg = loadImage("assets/fire-bg.png");
  mainSong = loadSound("assets/icebreaker-main.mp3");
  menuSong = loadSound("assets/icebreaker-menu.mp3");
  snowFont = loadFont("assets/SnowtopCaps.otf");
}

function setup() {
  createCanvas(600, 1000);
  world.gravity.y = 15;
  //frameRate(40); // fix lagging

  storedScores = getItem("storedScores");
  if (storedScores) {
    // If there are stored scores, use them instead of the default high scores
    highScores = storedScores;
  }

  platforms = new Group(); // set up platform details
  platforms.img = platImg;
  platforms.collider = "kinematic"; // platforms move by programming, not by collision
  platforms.x = () => random(0, canvas.w); // randomize horizontal placement of platforms
  platforms.y = (i) => canvas.h + i * 125; // control vertical spacing of platforms
  platforms.w = 200;
  platforms.h = 15;
  platforms.velocity.y = 0; // control speed of platforms; larger = faster
  platforms.amount = 100;

  platformStart = new Sprite(); // create first platform in center position
  platformStart.img = platImg;
  platformStart.collider = "kinematic";
  platformStart.x = canvas.w / 2; // sets first platform at center horizontally
  platformStart.y = canvas.h - 125; // sets first platform vertically with same spacing
  platformStart.w = 200;
  platformStart.h = 15;
  platformStart.velocity.y = 0;

  ball = new Sprite(canvas.w / 2, canvas.h - 200, 50); // create ball above first platform
  ball.img = bSprite;
  ball.collider = "static";
  ball.bounciness = 0.3;

  userStartAudio().then(function () {
    menuSong.play();
  });
}

function draw() {
  renderStats();
  background(canvasBg);
  startGame(); // switch to button later
  if (gameStart == true) {
    // starts game movement and score counting
    ball.img = bSprite;
    ball.collider = "static"; // change to dynamic once bug is fixed
    platformStart.velocity.y = -10;
    platforms.velocity.y = -10; // change to -1 after fix
    countScore();
  }
  if (outOfBounds == true && mouse.presses()) {
    // only works if ball is off screen
    restartGame();
  }
  gameEnd();
}

function drawPlatforms() {
  // separate function, can be used with start button later
  new platforms.Sprite(); // draw platforms to canvas
  if (kb.pressing("left")) {
    platformStart.rotation = -15;
    platforms.rotation = -15;
  } else if (kb.pressing("right")) {
    platformStart.rotation = 15;
    platforms.rotation = 15;
  } else {
    platformStart.rotation = 0;
    platforms.rotation = 0;
  }

  //testing by removing platforms
  for (let i = 0; i < platforms.length; i++) {
    let platform = platforms[i];

    if (platform.position.y < 100) {
      platform.remove();
    }
  }
}

function boundaryCheck() {
  // what happens when ball goes out of bounds
  if (ball.x > canvas.w || ball.x < 0 || ball.y > canvas.h || ball.y < 0) {
    // check position of ball relative to canvas dimensions
    platformStart.velocity.y = 0;
    platforms.velocity.y = 0; // stops platform movement
    ball.remove(); // remove out of bounds ball
    outOfBounds = true;
    gameStart = false;
    score = 0;
  }
}

function startGame() {
  // control when game starts running
  drawPlatforms(); // can be relocated for use with start button later
  boundaryCheck(); // check if ball is out of canvas and end game
}

function restartGame() {
  // restart game after losing
  allSprites.remove(); // clear previous platforms
  ball = new Sprite(canvas.w / 2, canvas.h - 200, 50); // redraw ball to starting position
  platformStart.velocity.y = -1;
  platforms.velocity.y = -1; // start platform movement
  outOfBounds = false;
  startGame();
}

function onOpen() {
  // hide try again button on open
  document.getElementById("endScreen").style.display = "none";
  canvasBg = snowBg;
}

function startButton() {
  // allow button to control game start
  canvas.style.display = "block";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  gameStart = true;
  finalScore = 0;
  mainSong.play();
  menuSong.stop();
  if (canvasBg === fireBg) {
    speed = -1.5;
  }
  if (canvasBg === beachBg) {
    speed = -0.8;
    ball.bounciness = 0.6;
  }
}

function homeButton() {
  // allow button to navigate to main menu
  canvas.style.display = "none";
  document.getElementById("startScreen").style.display = "block";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("ruleScreen").style.display = "none";
  document.getElementById("selectScreen").style.display = "none";
  ball.collider = "static";
  platformStart.velocity.y = 0;
  platforms.velocity.y = 0;
  if (menuSong.isPlaying()) {
  } else {
    menuSong.play();
  }
}

function charButton() {
  canvas.style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("ruleScreen").style.display = "none";
  document.getElementById("selectScreen").style.display = "block";
  ball.collider = "static";
  platformStart.velocity.y = 0;
  platforms.velocity.y = 0;
}

function gameEnd() {
  // hide canvas on game end and show try again button
  if (outOfBounds == true) {
    canvas.style.display = "none";
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("endScreen").style.display = "block";
    document.getElementById("gameScreen").style.display = "none";
    document.getElementsByClassName("finalScore")[0].innerHTML =
      "Congratulations! Score: " + Math.floor(finalScore).toString();
    doHighScores(); // update the high score list
    mainSong.stop();
  }
}

function rulesButton() {
  canvas.style.display = "none";
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "none";
  document.getElementById("ruleScreen").style.display = "block";
  ball.collider = "static";
  platformStart.velocity.y = 0;
  platforms.velocity.y = 0;
}

function countScore() {
  // function that counts the score, runs while the gameplay is ongoing
  finalScore += 0.1; // score and final score are two different variables to make printing the final score easier
  score += 0.1;
  noStroke();
  fill(255);
  let fontsize = 50;
  textSize(fontsize);
  textFont(snowFont);
  text("Score: " + Math.floor(score).toString(), 10, 50);
}

function doHighScores() {
  highScores.push(Math.floor(finalScore)); // Add the new score to the list
  highScores.sort(function (a, b) {
    return b - a;
  }); // Sort the scores in descending order
  highScores = Array.from(new Set(highScores)).slice(0, 5); // Remove duplicates and keep only the top five scores
  document.getElementsByClassName("highScores")[0].innerHTML =
    "High Scores:<br>" + highScores.join("<br>"); // Display the updated high scores
  storedScores = highScores; // Update storedScores for future use
  storeItem("storedScores", storedScores);
}

function resetHighScores() {
  // // reset the stored scores and high score list
  highScores.length = 0; // removes all prior scores
  doHighScores(); // resets high score list to only show the most recent score
}

function ballButton1() {
  // set assets and bg to beach
  bSprite = "assets/beachball.png";
  ball.img = bSprite;
  platImg = "assets/sand-platform.png";
  platformStart.img = platImg;
  platforms.img = platImg;
  canvasBg = beachBg;
  document.getElementById("ballButton1").style.color = "red"; // style as selected
  document.getElementById("ballButton2").style.color = "black";
  document.getElementById("ballButton3").style.color = "black";
  ball.bounciness = 0.6;
  world.gravity.y = 8;
  speed = -0.8;
}
function ballButton2() {
  // set assets and bg to snowy
  bSprite = "assets/snowball.png";
  ball.img = bSprite;
  platImg = "assets/snow-platform.png";
  platformStart.img = platImg;
  platforms.img = platImg;
  canvasBg = snowBg;
  document.getElementById("ballButton1").style.color = "black";
  document.getElementById("ballButton2").style.color = "red"; // style as selected
  document.getElementById("ballButton3").style.color = "black";
  ball.bounciness = 0.3;
  world.gravity.y = 15;
  speed = -1;
}
function ballButton3() {
  // set assets and bg to fire
  bSprite = "assets/fireball.png";
  ball.img = bSprite;
  platImg = "assets/fire-platform.png";
  platformStart.img = platImg;
  platforms.img = platImg;
  canvasBg = fireBg;
  document.getElementById("ballButton1").style.color = "black";
  document.getElementById("ballButton2").style.color = "black";
  document.getElementById("ballButton3").style.color = "red"; // style as selected
  world.gravity.y = 30;
  speed = -1.5;
}

// to do
// bug fix the platform count... yayyyy
// style the buttons
// choose a font
// audio control buttons
// add a cool title screen
// test platform spacing, gravity, velocity, etc
