var menu = {};

menu.particles = [];

menu.createParticles = function() {
	var particle = {
		x: Math.random() * (window.innerWidth - 1) + 1,
		y: Math.random() * (window.innerHeight - 1) + 1,
		xVel: ((Math.random() * 6) - 3),
		yVel: ((Math.random() * 6) - 3),
		height: 3.5,
		width: 3.5,
		alpha: 1,
		color: "white"
	}
	menu.particles.push(particle);
};

menu.drawParticles = function(canvasContext) {
	for(var i = 0; i < menu.particles.length; i++) {
		var p = menu.particles[i]
		canvasContext.fillStyle = p.color;
		canvasContext.globalAlpha = p.alpha;
		canvasContext.fillRect(p.x,p.y,p.width,p.height);
		canvasContext.stroke();
	}
};

menu.updateParticles = function() {
	for(var i = 0; i < menu.particles.length; i++) {
		var p = menu.particles[i];
		p.x += p.xVel;
		p.y += p.yVel;

		if( (p.x < 0) || (p.x > window.innerWidth) ) {
			p.xVel = -p.xVel;
		}
		if( (p.y < 0 )|| (p.y > window.innerHeight) ) {
			p.yVel = -p.yVel;
		}		
	}
};

menu.draw = function(canvas, canvasContext) {
	text.drawText(canvasContext, "pong",  (canvas.width / 2 - 280),100,25, 10);
	text.drawText(canvasContext, "press space to play",  (canvas.width / 2 - 290),500,5, 5);
	text.drawText(canvasContext, "press p to pause",  (canvas.width / 2 - 150),550,3, 3);
	menu.drawParticles(canvasContext);
};

menu.quit = function() {
	menu.particles = [];
};

menu.update = function(canvas) {
	if(menu.particles.length < 75) {
		menu.createParticles();
	}
	menu.updateParticles();
};