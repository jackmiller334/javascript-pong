var game = {};

game.playerScore = 0;
game.computerScore = 0;
game.particleSpawnTimer = 200;
game.particles = [];
game.particleSpeed = 0.1;
game.particleSize = 10;
game.enemySpeed = 7;
game.hitCount = 0;
game.messageInterval = 10000;
game.paused = false;

game.message = function(message,x,y,alpha,size,spacing,duration) {
	this.message = message;
	this.x = x;
	this.y = y;
	this.alpha = alpha;
	this.size = size;
	this.spacing = spacing;
	this.duration = duration;
};

game.activeMessages = [];

game.ballInitX = window.innerWidth / 2 - 50;
game.ballInitY = window.innerHeight / 2 - 72;

game.padInitialY = window.innerHeight / 2 - 100;
game.paddleTwoX = window.innerWidth - 30;

game.paddleOne = {
	x: 20,
	y: game.padInitialY,
	width:15,
	height:100,
};

game.paddleOne.draw = function(canvasContext) {
	canvasContext.fillStyle = "white";
	canvasContext.fillRect(this.x,this.y,this.width,this.height);
	canvasContext.stroke();
};

game.paddleOne.getInput = function() {
	if (game.keys[38]) {
	   	if(this.y > 0) {
		    this.move(-10);  		
	   	}
	}
	if (game.keys[40]) {
		if(this.y < window.innerHeight - 80) {
		    this.move(10); 		
	    }
	}
};

game.paddleOne.move = function(movement) {
	this.y += movement;
};

game.paddleTwo = {
	x: game.paddleTwoX,
	y: game.padInitialY,
	width:15,
	height:100,
	speed: 7,
	colour: "white"
};

game.paddleTwo.draw = function(canvasContext) {
	canvasContext.fillStyle = this.colour;
	canvasContext.fillRect(this.x,this.y,this.width,this.height);
	canvasContext.stroke();
};

game.paddleTwo.update = function() {
	this.x = window.innerWidth - 30;
};

game.paddleTwo.speedUp = function() {
	if(Math.round(Math.random()) == 1) {
		this.PID.pGain = 4000;
		game.addEnemyTaunt("grrrr");
		this.colour = "orange";
	}
};

game.paddleTwo.PID = {
	pGain: 2000,
	iGain: 100,
	dGain: 10000,
	error: 0,
	previousError: 0,
	integral: 0
};

game.paddleTwo.reset = function() {
	this.colour = "white";
	this.y = game.padInitialY;
};

game.paddleTwo.move = function(delta) {

	this.PID.error = (this.y + this.height / 4) - (game.ball.y + game.ball.height / 4);

	this.PID.error /= 1000;

	this.PID.proportional = this.PID.pGain * this.PID.error;

	this.PID.integral = this.PID.integral + (this.PID.error*delta);

	this.PID.derivate = (this.PID.error - this.PID.previousError) / delta;

	var output = (this.PID.proportional) + (this.PID.iGain * this.PID.integral) + (this.PID.dGain * this.PID.derivate);

	this.PID.previousError = this.PID.error;

	var moveSpeed = output / 100;

	//Prevent the enemy paddle from going too low...
	if(game.paddleTwo.y > window.innerHeight - 80) {
		game.paddleTwo.y = window.innerHeight - 80
	}
	///... or too high
	if(game.paddleTwo.y < 0) {
		game.paddleTwo.y = 0;
	}
	game.paddleTwo.y -= moveSpeed;	
};

game.randomXPos = function() {
	return Math.floor(Math.random()*(window.innerWidth - 400) + 20);
};
game.randomYPos = function() {
	return Math.floor(Math.random()*(window.innerHeight - 20) + 20);
};

game.randomXDirection = function() {
	var r = Math.floor(Math.random()*(2-0)+0);
	if(r) {
		return 7;
		}
	return -7;
};

game.randomYDirection = function() {
	var r = Math.floor(Math.random()*(2-0)+0);
	if(r) {
		return 3;
		}
	return -2;		
};

game.ball = {
	initialX: game.ballInitX,
	initialY: game.ballInitY,
	x: game.ballInitX,
	y: game.ballInitY,
	xVel: game.randomXDirection(),
	yVel: game.randomYDirection(),
	height: 20,
	width: 20,
	collisionTimer: 0,
	color: "white",
	MAX_Y_VELOCITY: 10,
	BALL_SPEED_INCREASE_MULTIPLIER: 1.05,
	COL_TIME: 500,
	MAX_BALL_SPEED: 34
};

game.ball.draw = function(canvasContext) {
	canvasContext.fillStyle = this.color;
	canvasContext.fillRect(this.x,this.y,this.width,this.height);
	canvasContext.stroke();		
};

game.ball.speedUp = function() {
	if( this.xVel < this.MAX_BALL_SPEED) {
		this.xVel *= this.BALL_SPEED_INCREASE_MULTIPLIER;
		this.yVel *= this.BALL_SPEED_INCREASE_MULTIPLIER;
	}
};

game.ball.checkCollision = function() {
	if(this.collisionTimer==0) {
		//At over 22 velocity, the ball is moving too fast for the below collision detection to work
		//Create two points either side of the ball to act as feelers. 
		//Feelers find out if the ball is going to collide, or should have collided
		//Only works upto a set speed - MAX_BALL_SPEED
		if(this.xVel > 22 || this.xVel < -22) {
			var feeler = {	
				xLeft: this.x - 5,
				xRight: this.x + 10,
				y: this.y + 5
			};
			if(this.checkCollisionAheadBehind(feeler)) {
				this.collisionTimer = this.COL_TIME;
				return true;
			}
			return false;
		}

		//Normal collision for slower ball speeds.
		if( (this.x >= game.paddleOne.x) && (this.x <= game.paddleOne.x + game.paddleOne.width) ) {
			if( (this.y <= game.paddleOne.y + game.paddleOne.height) && (this.y >= game.paddleOne.y - 10) ) {
				audio.playerPaddleHit.play();
				this.collisionTimer = this.COL_TIME;
				return true;
			}
		}
		if( (this.x >= game.paddleTwo.x - game.paddleTwo.width) && (this.x <= game.paddleTwo.x + game.paddleTwo.width - 5) ) {
			if( (this.y <= game.paddleTwo.y + game.paddleTwo.height) && (this.y >= game.paddleTwo.y - 10) ) {
				audio.computerPaddleHit.play();
				this.collisionTimer = this.COL_TIME;
				return true;
			}
		}
	}
	return false;
};

game.ball.checkCollisionAheadBehind = function(feeler) {
	//moving Left
	if(this.xVel < 0) {
		if( (feeler.xLeft >= game.paddleOne.x - 10) && (feeler.xLeft <= game.paddleOne.x + game.paddleOne.width) ) {
			if( (feeler.y <= game.paddleOne.y + game.paddleOne.height) && (feeler.y >= game.paddleOne.y - 10) ) {
				audio.playerPaddleHit.play();
				return true;
			}
		}
		if( (feeler.xRight >= game.paddleOne.x - 10) && (feeler.xRight <= game.paddleOne.x + game.paddleOne.width) ) {
			if( (feeler.y <= game.paddleOne.y + game.paddleOne.height) && (feeler.y >= game.paddleOne.y - 10) ) {
				audio.playerPaddleHit.play();
				return true;
			}
		}
	}
	//moving right
	if(this.xVel > 0) {
		if( (feeler.xLeft >= game.paddleTwo.x - game.paddleTwo.width) && (feeler.xLeft <= game.paddleTwo.x + game.paddleTwo.width - 5) ) {
			if( (feeler.y <= game.paddleTwo.y + game.paddleTwo.height) && (feeler.y >= game.paddleTwo.y - 10) ) {
				audio.computerPaddleHit.play();
				return true;
			}
		}
		if( (feeler.xRight >= game.paddleTwo.x - game.paddleTwo.width) && (feeler.xRight <= game.paddleTwo.x + game.paddleTwo.width - 5) ) {
			if( (feeler.y <= game.paddleTwo.y + game.paddleTwo.height) && (feeler.y >= game.paddleTwo.y - 10) ) {
				audio.computerPaddleHit.play();
				return true;
			}
		}
	}
	return false;
};

game.ball.checkHitArea = function() {
	var area = 0;
	//Ball has hit left paddle
	if(this.x < window.innerWidth / 2) {
		area = this.y - game.paddleOne.y;
	//this has hit right paddle
	} else {
		area = this.y - game.paddleTwo.y;
	}

	if(area <= 20 || area >= 80) {
		//add more y velocity 
		var vel = 60/100 * this.yVel;
		this.yVel += vel;
	} else {
		//remove y velocity
		var vel = 15/100 * this.yVel;
		this.yVel -= vel;
	}

	if(this.yVel > this.MAX_Y_VELOCITY) {
		this.yVel = this.MAX_Y_VELOCITY;
	} else if(this.yVel < -this.MAX_Y_VELOCITY) {
		this.yVel = -this.MAX_Y_VELOCITY;
	}
};

game.ball.reset = function() {
 	this.x = window.innerWidth / 2 - 50;
 	this.y = window.innerHeight / 2 - 72;
	this.xVel = game.randomXDirection();
	this.yVel = game.randomYDirection();
	this.color = "white";
};

game.keys = [];

document.body.addEventListener("keydown", function (e) {
    game.keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {	   
	game.keys[e.keyCode] = false;	
});

game.particleDirection = function(vel) {
	var low = vel - 5;
	var high = vel + 5;
	return Math.floor(Math.random()*(high-low+high)+low);
};

game.addEnemyTaunt = function(message) {
	var m = new game.message(message, game.paddleTwo.x - 100, game.paddleTwo.y, 0.1,5,2,30);
	game.activeMessages.push(m);
};

game.addRandomTaunt = function() {
	var text = game.taunts[Math.floor(Math.random() * game.taunts.length)];
	var m = new game.message(text, game.randomXPos(), game.randomYPos(), 0.1,2,2,10);
	game.activeMessages.push(m);
};

game.createParticle = function() {
	var particle = {
		x: game.ball.x + (game.ball.height / 2),
		y: game.ball.y,
		xVel: game.particleDirection(-game.ball.xVel),
		yVel: game.particleDirection(-game.ball.yVel),
		height: game.particleSize,
		width: game.particleSize,
		alpha: 1,
		color: game.ball.color
	};
	game.particles.push(particle);
};

game.deleteParticles = function() {
	for(var i = 0; i < game.particles.length; ++i) {
		if(game.particles[i].alpha < 0.1) {
			game.particles.splice(i, 2);
		}
	}
};

game.checkForScore = function(canvas) {
	if(game.ball.x < -150) {
		audio.loss.play();
		game.computerScore++;
		game.onScore();
		game.addEnemyTaunt("ha.");
	} else if(game.ball.x > canvas.width + 150) {
		game.playerScore++;
		game.onScore();
	}
};

game.drawPaddles = function(canvasContext) {
	game.paddleOne.draw(canvasContext);
	game.paddleTwo.draw(canvasContext);
};

game.drawText = function(canvasContext, text, positionX, positionY, size, spacing, alpha) {
	var initialY = positionY;
	var letter;
	for(var i = 0; i < text.length; ++i) {
		letter = letters[text.charAt(i)];
		for(var j = 0; j < 5; ++j) {
			positionY = initialY;
			for(var k = 0; k < 5; ++k) {
				if(letter[k*5 + j] == 1) {
					canvasContext.fillStyle = "white"
					canvasContext.globalAlpha = alpha;
					canvasContext.fillRect(positionX,positionY,size,size);
					canvasContext.stroke();
				}
				positionY += size;
			}
			positionX += size;
		}
		positionX += spacing;
	}
};

game.drawActiveMessages = function(canvasContext) {
	if(game.activeMessages.length) {
		for(var i = 0; i < game.activeMessages.length; ++i) {
			game.drawText(canvasContext, game.activeMessages[i].message, 
			game.activeMessages[i].x,
			game.activeMessages[i].y,
			game.activeMessages[i].size,
			game.activeMessages[i].spacing,
			game.activeMessages[i].alpha);
		}
	}
};

game.drawLine = function(canvasContext) {
	canvasContext.beginPath();
	canvasContext.setLineDash([20]);
	canvasContext.strokeStyle = "#ffffff";
	canvasContext.moveTo(window.innerWidth / 2,20);
	canvasContext.lineTo(window.innerWidth /2 ,window.innerHeight - 20);
	canvasContext.stroke();
};

game.drawDebug = function(canvasContext) {
	canvasContext.beginPath();
	canvasContext.strokeStyle = "red";
	canvasContext.moveTo(game.paddleTwo.x - game.paddleTwo.width,game.paddleTwo.y);
	canvasContext.lineTo(game.paddleTwo.x - game.paddleTwo.width , game.paddleTwo.y + game.paddleTwo.height);
	canvasContext.stroke();

	var point = {	
		xLeft: game.ball.x - 8,
		xRight: game.ball.x + 16,
		y: game.ball.y + 5
	};

	canvasContext.fillStyle = "red";
	canvasContext.fillRect(point.xLeft,point.y,10,10);
	canvasContext.stroke();		

	canvasContext.fillStyle = "green";
	canvasContext.fillRect(point.xRight,point.y,10,10);
	canvasContext.stroke();	
};

game.drawParticles = function(canvas) {
	for(var i = 0; i < game.particles.length; ++i) {
		var p = game.particles[i]
		canvas.fillStyle = p.color;
		canvas.globalAlpha = p.alpha;
		canvas.fillRect(p.x,p.y,p.width,p.height);
		canvas.stroke();
	}
};

game.draw = function(canvas) {
	game.drawLine(canvas);
	game.drawPaddles(canvas);
	game.ball.draw(canvas);
	text.drawScore(canvas, game.playerScore, window.innerWidth / 2 - 80, 20, 15);
	text.drawScore(canvas, game.computerScore, window.innerWidth / 2 + 30, 20 ,15);
	game.drawParticles(canvas);
	game.drawActiveMessages(canvas);
};

game.resetParticleSpawnTimer = function() {
	game.particleSpawnTimer = 200;	
};

game.resetSounds = function() {
	audio.playerPaddleHit.volume = 0.4;
	audio.computerPaddleHit.volume = 0.4;			
	audio.tension.currentTime = 0;
	audio.tension.volume = 0;
};

game.resetEnemySpeed = function() {
	game.enemySpeed = 7;
};

game.resetPaddles = function() {
	game.paddleOne.y = window.innerHeight / 2 - 100;
	game.paddleTwo.y = window.innerHeight / 2 - 100;
};

game.resetActiveMessages = function() {
	game.activeMessages = [];
}

game.updateParticles = function() {
	for(var i = 0; i < game.particles.length; ++i) {
		var p = game.particles[i]
		p.x += (p.xVel / 10);
		p.y += (p.yVel / 10);
		p.alpha *= 0.89;
	}
	game.deleteParticles();
};

game.onScore = function() {
	game.hitCount = 0;
	game.ball.reset();
	game.resetParticleSpawnTimer();
	game.resetEnemySpeed();
	game.paddleTwo.reset();
	game.resetSounds();
};

game.speedUp = function() {
	game.particleSpawnTimer *= 0.93;
	game.adjustSounds();		
	game.ball.speedUp();
	game.hitCount++;
	if(game.hitCount == 10) {
		game.paddleTwo.speedUp();
	}
};

game.adjustSounds = function() {

	audio.tension.volume += 0.05;
	audio.playerPaddleHit.volume -= 0.03;
	audio.computerPaddleHit.volume -= 0.03;	

	if(audio.tension.volume > audio.MAX_MUSIC_VOLUME) {
		audio.tension.volume = audio.MAX_MUSIC_VOLUME;
	}

	if(audio.playerPaddleHit.volume < audio.LOWEST_SFX_VOLUME) {
		audio.playerPaddleHit.volume = audio.LOWEST_SFX_VOLUME;
	}
	if(audio.computerPaddleHit.volume < audio.LOWEST_SFX_VOLUME) {
		audio.computerPaddleHit.volume = audio.LOWEST_SFX_VOLUME;
	}
};

game.resetGame = function() {
	game.hitCount = 0;
	game.playerScore = 0;
	game.computerScore = 0;
	game.ball.reset();
	game.resetParticleSpawnTimer();
	game.resetEnemySpeed();
	game.resetSounds();
	game.resetActiveMessages();
	game.messageInterval = 10000;
	game.paddleTwo.reset();
};

game.getInput = function() {
	game.paddleOne.getInput();
};

game.updateActiveMessages = function() {
	if(game.activeMessages.length) {
		for(var i = 0; i < game.activeMessages.length; ++i) {
			var m = game.activeMessages[i];
			if(m.alpha <= 0.7) {
				if(m.duration > 0) {
					m.alpha *= 1.05;
				}
			}
			if(m.alpha >= 0.7) {
				m.duration -= 1;
			}

			if(m.duration <= 0) {
				m.alpha -= 0.025;
			}

			if(m.alpha <= 0) {
				game.activeMessages.splice(i, 1);
			}
		}
	}
};

game.updateBall = function(canvas, delta) {
	game.ball.x += game.ball.xVel;
	game.ball.y += game.ball.yVel;
	if ( (game.ball.y < 0) || (game.ball.y > canvas.height - game.ball.height) ){
		game.ball.yVel = -game.ball.yVel;
	}

	if(game.ball.checkCollision()) {
		game.ball.checkHitArea();
		game.ball.xVel = -game.ball.xVel;
		game.speedUp();
	}

	if(game.ball.collisionTimer > 0) {
		game.ball.collisionTimer -= delta;
		if(game.ball.collisionTimer < 0) {
			game.ball.collisionTimer = 0;
		}
	}

	if(game.ball.xVel > 10) {
		game.ball.color = "#c88300";
	}
	if(game.ball.xVel > 12) {
		game.ball.color = "#d17300";
	}
	if(game.ball.xVel > 14) {
		game.ball.color = "#ff2600";
	}
	if(game.ball.xVel > 16) {
		game.ball.color = "#FF2600";
	}
};

game.togglePause = function() {
	if(game.paused) {
		game.paused = false;
		audio.tension.play();
	} else {
		game.paused = true;
		audio.tension.pause();
	}
};

game.isOver = function() {
	if( (game.playerScore > 9) || (game.computerScore > 9) ) {
		return true;
	} 
	return false;
}

game.getWinner = function() {
	if(game.playerScore > game.computerScore) {
		return "you win :)";
	} else {
		return "you lose :(";
	}
}

game.quit = function() {
	audio.stopMusic();
};

game.timer = 0;

game.update = function(canvas, delta) {
	if(!game.paused) {
		game.updateBall(canvas, delta);
		game.updateParticles();
		game.checkForScore(canvas);
		game.paddleTwo.move(delta);
		game.paddleTwo.update();
		game.updateActiveMessages();

		game.timer += delta;
		
		if(game.timer > game.particleSpawnTimer) {
			game.createParticle();
			game.timer = 0;
		}
	}
};
	
