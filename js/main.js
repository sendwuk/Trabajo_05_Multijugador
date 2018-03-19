var game = new Phaser.Game(1280, 720, Phaser.AUTO, document.getElementById('game'));
game.state.add('Game',Game);
game.state.start('Game');
