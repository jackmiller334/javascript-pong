var audio = {}

audio.playerPaddleHit = new Audio('audio/hit1.mp3');
audio.computerPaddleHit = new Audio('audio/hit2.mp3');
audio.loss = new Audio('audio/loss.mp3');
audio.score = new Audio('audio/score.wav');
audio.tension = new Audio('audio/tension.mp3');
audio.playerPaddleHit.volume = 0.4;
audio.computerPaddleHit.volume = 0.4;
audio.score.volume = 0.4;
audio.loss.volume = 0.4;
audio.tension.volume = 0;

audio.LOWEST_SFX_VOLUME = 0.1;
audio.MAX_MUSIC_VOLUME = 0.7;

audio.init = function() {
	audio.tension.play();
};

audio.stopMusic = function() {
	audio.tension.currentTime = 0;
	audio.tension.pause();
};