const MAX_ENEMY = 8;
const MAX_LIFE = 3;

let spaceShip;
let boss;
let enemies = [];
let bullets = [];
let bonus = [];
let explosions = [];
let enemyBullets = [];
let explosionAnim = [];
let bonusImg = [];
let spaceShipImg;
let bossImg = [];
let bulletImg;
let bulletEnemyImg;
let enemyImg1;
let enemyImg1b;
let enemyImg2;
let enemyImg3;
let state = 0;
let stars = [];

function preload() {
  asterohit = loadSound('assets/sound/asterohit.mp3');
  pew = loadSound('assets/sound/laserfire01.wav');
  boom = loadSound('assets/sound/explosion.wav');
  pboom = loadSound('assets/sound/playerexplosion.wav');
  coin = loadSound('assets/sound/coin01.wav');
  hit = loadSound('assets/sound/hit1.mp3');
  enemyfire = loadSound('assets/sound/enemyfire.mp3');
  song1 = loadSound('assets/sound/mercury.wav');
  song2 = loadSound('assets/sound/mars.wav');
  song3 = loadSound('assets/sound/venus.wav');
  song4intro = loadSound('assets/sound/intro jingle.wav');
  //humm = loadSound('assets/sound/scifihumm.mp3');

	spaceShipImg = loadImage('assets/img/spaceShip.png');
  //spaceShipImg = loadImage('assets/img/ship_1.png');
	bulletImg = loadImage('assets/img/laser.png');
	bulletEnemyImg = loadImage('assets/img/bullet2.png');
	enemyImg1 = loadImage('assets/img/enemy1.png');
	enemyImg1b = loadImage('assets/img/enemy1b.png');
	enemyImg2 = loadImage('assets/img/enemy2.png');
	enemyImg3 = loadImage('assets/img/enemy3.png');
	myFont = loadFont('fonts/gameboy.ttf');

	for (let i = 1; i<7; i++) {
		explosionAnim.push(loadImage('assets/img/expl'+i+'.png'));
	}
	bonusImg[0] = loadImage('assets/img/bonus0.png');
	bossImg[0] = loadImage('assets/img/boss0.png');


}

function songPlayer() {
  //if (!humm.isPlaying()) {humm.play();}
  if (state == 0) {
    if (song3.isPlaying()) {song3.stop();}
    if (song1.isPlaying()) {song1.stop();}
    if (!song2.isPlaying()) {song2.play();}
  }
  if (state == 1) {
    if (song2.isPlaying()) {song2.stop();}
    if (song3.isPlaying()) {song3.stop();}
    if (!song1.isPlaying()) {song1.play();}
  }
  if (state == 99) {
    if (song2.isPlaying()) {song2.stop();}
    if (song1.isPlaying()) {song1.stop();}
    if (!song3.isPlaying()) {song3.play();}
  }

}

function centerCanvas(cnv) {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}

function setup() {
	frameRate(30);
  var canvas = createCanvas(400, 700);
  songPlayer();
  centerCanvas(canvas);
  canvas.parent('sketch-holder');
	spaceShip = new SpaceShip(MAX_LIFE);

	for (let i=0; i<MAX_ENEMY; i++) {
		enemies[i] = new Enemy();
	}
	for (let i = 0; i<100; i++) {
		stars[i] = new Star(random(0, width), random(-height, height));
	}
}
function draw() {
	background(5,0,12);
  songPlayer();
	if (state == 0) {
		// Final Screen

		movementOfStars();
		fill(255);
		textFont(myFont);
		textSize(28);
		textStyle(BOLD);
		textAlign(CENTER);
		text("SpaceShooter", width / 2,150);
		textSize(12);
		text("Push to start", width / 2,300);
		text("Drag around to move", width / 2,350);
		text("Automatic fire", width / 2,400);

		text("By Skedadle - 2021", width / 2,height - 30);
	} else if (state == 1) {

		//Score and Life

		movementOfStars();
		spaceShip.show();
		spaceShip.move();
		if (spaceShip.life <= 0) {
      pboom.play();
			state = 99;
		}


		//Enemy's move
		for (enemy of enemies) {
			enemy.move();
			if (enemy.fire()) {
				enemyBullets.push(new EnemyBullet(enemy.x, enemy.y, enemy.radius));
			}
			enemy.show();
		}

		// Bonus
		if (random(1,100) <= 2) {
			bonus.push(new Bonus);
		}
		for (i = 0; i < bonus.length; i++) {
			bonus[i].move();
			bonus[i].show();
			if (intersectWith(bonus[i], spaceShip)) {
				bonus[i].effect(spaceShip);
				bonus[i].y = -10;
			}
			if (bonus[i].y < 0) {
				bonus.splice(1, i);
			}
		}

		//Eplosion draw
		for (let i = 0; i < explosions.length; i++) {
			//explosion(explosions[i].x, explosions[i].y, explosions[i].z);
			if (explosions[i].z + 6 > frameCount) {
				//console.log('explose');
				explosion(explosions[i].x, explosions[i].y, explosions[i].z);
			} else {
				explosions.splice(i,1);
			}

		}

		fill(255);
		textFont(myFont);
		textStyle(BOLD);
		text(spaceShip.score, width/2,30);
    lifeStr = "Life : " + spaceShip.life;
		text(lifeStr, width - textWidth(lifeStr),30);


		// Enemy out of screen
		for (let i = 0; i < enemies.length; i++) {
			if (intersectWith(spaceShip, enemies[i])) {
        pboom.play();
				background(255,0,0);
				spaceShip.life -=1;
				enemies[i].reborn();
			}
			if (enemies[i].y >height) {
				enemies[i].reborn();
			}
		}
		// Bullet's move
		bulletMove();
		// Enemy's bullet
		bulletEnemyMove();
	} else if (state = 99) {
		// Final Screen
		movementOfStars();
		for (enemy of enemies) {
			enemy.move();
			enemy.show();
		}
		fill(255);
		textFont(myFont);
		textSize(12);
		text(spaceShip.score, 30,30);
		textSize(32);
		textStyle(BOLD);
		textAlign(CENTER);
		text("GAME OVER", width / 2,150);
		textSize(12);
		text("Press 'Return' to restart", width / 2,300);


	}


}

function keyPressed() {
	if (state == 0) {
    //game lost
		if (keyCode === RETURN) {
      song4intro.play();
			state = 1;
		}
	}else if(state ==1) {
		if (keyCode === LEFT_ARROW) {
			spaceShip.direction = -1;
		} else if (keyCode === RIGHT_ARROW) {
			spaceShip.direction = 1;
		}

		if (keyCode === UP_ARROW) {
			spaceShip.upDown = -1;
		} else if (keyCode === DOWN_ARROW) {
			spaceShip.upDown = 1;
		}

		if (key === ' ') {
      pew.play();
			bullets.push(new Bullet(spaceShip.x, spaceShip.y));
		}
	} else if (state == 99) {
		if (keyCode === RETURN) {
			state = 1;
			enemies = [];
			bullets = [];
			enemyBullets = [];
			setup();
		}
	}
}

function keyReleased() {
	if (keyCode === LEFT_ARROW) {
		spaceShip.direction = 0;
	} else if (keyCode === RIGHT_ARROW) {
		spaceShip.direction = 0;
	}

	if (keyCode === UP_ARROW) {
		spaceShip.upDown = 0;
	} else if (keyCode === DOWN_ARROW) {
		spaceShip.upDown = 0;
	}
}

function intersectWith(object1, object2) {
	let distance = dist(object1.x, object1.y, object2.x, object2.y);
	if (distance < object1.radius + object2.radius) {
		return true;
	} else {
		return false;
	}
}

function movementOfStars() {
	for (star of stars) {
			star.move();
			star.show();
		}
}

function explosion(x,y, startFrame) {
	image(explosionAnim[(frameCount - startFrame) % 6], x, y);
}

function bulletMove() {
	for (let i = 0; i < bullets.length; i++) {
		bullets[i].move();
		bullets[i].show();
		for (let j = 0; j < enemies.length; j++) {
			if (intersectWith(bullets[i], enemies[j])) {
        asterohit.play();
				bullets[i].y = - 10;
				enemies[j].life -=1;
				if (enemies[j].life == 0) {
          boom.play();
					explosions.push(createVector(enemies[j].x,enemies[j].y, frameCount));
					enemies[j].reborn();
					spaceShip.score += enemies[j].point;
				}

			}
		}
	}
	// Remove bullet when it's out of screen
	for (i = 0; i < bullets.length; i++) {
		if (bullets[i].y < 0) {
			bullets.splice(i, 1);
		}
	}
}

function bulletEnemyMove(){
	for (bullet of enemyBullets) {
		bullet.move();
		bullet.show();
		if (intersectWith(bullet, spaceShip)) {
			// Go out of the screen
      hit.play();
			bullet.y = height +10;
			spaceShip.life -=1;
			background(255,0,0);
		}
	}
	// Remove bullet when it's out of screen
	for (i = 0; i < enemyBullets.length; i++) {
		if (enemyBullets[i].y > height) {
			enemyBullets.splice(i, 1);
		}
	}
}
