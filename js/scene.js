var scene = {};

// Get the canvas element from the page
scene.canvas = document.getElementById("pong-canvas");
scene.canvas.width  = window.innerWidth;
scene.canvas.height = window.innerHeight;
scene.canvasCtx = scene.canvas.getContext("2d");
scene.paused = false;

scene.states = {
	MENU: 0,
	PLAYING: 1,
	OVER: 2
};

scene.fps = 120;
scene.then = Date.now();
scene.interval = 1000/scene.fps;

//Add a placeholder function for browsers that don't have setLineDash()
if (!scene.canvasCtx.setLineDash) {
   scene.canvasCtx.setLineDash = function () {};
}

window.addEventListener("keydown", function(e) {
	if(scene.currentState == scene.states.MENU) {
		if(e.keyCode == 32) {
			game.resetGame(); //Begin a new game
			scene.currentState = scene.states.PLAYING;
			menu.quit();
			audio.init();
		}
	}

	if(scene.currentState == scene.states.PLAYING) {
		if(e.keyCode == 80) {
			game.togglePause();
		}
		if(e.keyCode == 81) {
			scene.currentState = scene.states.MENU;
			game.quit();
		}
		if(e.keyCode == 32) {
			game.resetGame();
		}
	}

	if(scene.currentState == scene.states.OVER) {
		if(e.keyCode == 32) {
			scene.currentState = scene.states.MENU;
		}
	}
});

scene.loop = function() {

	var now = Date.now();
	var delta = now - scene.then;

	if(delta > scene.interval) {

		scene.canvas.width = window.innerWidth;
		scene.canvas.height = window.innerHeight;

		scene.canvas.style.width = window.innerWidth;
		scene.canvas.style.height = window.innerHeight;

		//clear screen
		scene.canvasCtx.clearRect(0, 0,scene.canvas.width, scene.canvas.height);

		if(scene.currentState == scene.states.MENU) {
			scene.menuLoop(delta);
		}
		if(scene.currentState == scene.states.PLAYING) {
			if(game.isOver()) {
				scene.gameWinner = game.getWinner();
				scene.currentState = scene.states.OVER;
			}
			scene.gameLoop(delta);
		}
		if(scene.currentState == scene.states.OVER) {
			scene.overLoop(delta);
		} 
		scene.then = now;
	}
	requestAnimationFrame(scene.loop);
};

scene.gameLoop = function(delta) {
	if(!scene.paused) {
		game.getInput();
		game.update(scene.canvas,delta);
	}
	game.draw(scene.canvasCtx);
};

scene.overLoop = function(delta) {
	over.update(scene.canvas,delta)
	over.draw(scene.canvas, scene.canvasCtx, scene.gameWinner);
};

scene.menuLoop = function(delta) {
	menu.update(scene.canvas,delta)
	menu.draw(scene.canvas, scene.canvasCtx);
};
