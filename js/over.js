var over = {};

over.particles = [];

over.createParticles = function() {
	var particle = {
		x: Math.random() * (window.innerWidth - 1) + 1,
		y: Math.random() * (window.innerHeight - 1) + 1,
		xVel: ((Math.random() * 6) - 3),
		yVel: ((Math.random() * 6) - 3),
		height: 3.5,
		width: 3.5,
		alpha: 1,
		color: "gold"
	}
	over.particles.push(particle)
};

over.drawParticles = function(canvasContext) {
	for(var i = 0; i < over.particles.length; i++) {
		var p = over.particles[i]
		canvasContext.fillStyle = p.color;
		canvasContext.globalAlpha = p.alpha;
		canvasContext.fillRect(p.x,p.y,p.width,p.height);
		canvasContext.stroke();
	}
};

over.updateParticles = function() {
	for(var i = 0; i < over.particles.length; i++) {
		var p = over.particles[i];
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

over.draw = function(canvas, canvasContext, message) {
	text.drawText(canvasContext, message,  (canvas.width / 2 - 400), 150, 15, 10);
	text.drawText(canvasContext, "press space to return",  (canvas.width / 2 - 190),550,3, 3);
	over.drawParticles(canvasContext);
};

over.quit = function() {
	over.particles = [];
};

over.update = function(canvas) {
	if(over.particles.length < 75) {
		over.createParticles();
	}
	over.updateParticles();
};
