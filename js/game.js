var Game = {};
var platforms;
var player;
var cursors;
var lollipops;
var score = 0;
var scoreText;
var lives;
var enemy;
var stateText;
var music;
Game.init = function(){
    game.stage.disableVisibilityChange=true;
};
Game.preload= function(){
    game.load.image('sky', 'assets/landscape.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('lollipop', 'assets/lollipop.png');
    game.load.image('heart','assets/heart.png');
    game.load.spritesheet('enemy','assets/enemy.png',77,65);
    game.load.spritesheet('dude', 'assets/player.png', 32.796, 48);
    game.load.audio('mainLoop', ['assets/audio/main_music.mp3']);
    game.load.audio('lollipopSound', ['assets/audio/level_up.mp3']);
    game.load.audio('enemyHit', ['assets/audio/hit.mp3']);
    game.load.audio('gameOverSound', ['assets/audio/game_over.mp3']);
    game.load.audio('youWin', ['assets/audio/you_win.mp3']);
};

Game.create= function(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.sprite(0,0,'sky');
    platforms=game.add.group();
    platforms.enableBody=true;
    var ground=platforms.create(0,game.world.height-64,'ground');
    ground.scale.setTo(2,2);
    ground.body.immovable=true;
    var ledge= platforms.create(400,400,'ground');
    ledge.body.immovable=true;
    ledge=platforms.create(-150,250,'ground');
    ledge.body.immovable=true;
    player = game.add.sprite(32, game.world.height - 150, 'dude',1);
    game.physics.arcade.enable(player);
    player.body.bounce.y = 0.0;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    enemy=game.add.sprite(0,0,'enemy',1);
    game.physics.arcade.enable(enemy);
    enemy.body.bounce.y=0.0;
    enemy.body.gravity.y = 300;
    enemy.body.collideWorldBounds=true;
    enemy.animations.add('left',[1, 2, 3, 4], 10, true);
    enemy.animations.add('right',[5, 6, 7, 8], 10, true);
    enemy.frame=0;
    cursors = game.input.keyboard.createCursorKeys();
    createlollipops();
    createLives();
    scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    game.add.text(650, 16, 'lives: ', { fontSize: '32px', fill: '#000' });
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '50px Arial', fill: '#000' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;
    music=game.add.audio('mainLoop');
    music.play();
    Game.playerMap={};
    Client.askNewPlayer();


};

Game.update = function () {
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(enemy,platforms);
    //player.body.velocity.x = 0;
    if (cursors.left.isDown) {
        player.body.velocity.x = -150;
        player.animations.play('left');
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 150;
        player.animations.play('right');
    } else {
      //  player.animations.stop();
        //player.frame = 4;
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
    }
    game.physics.arcade.collide(lollipops, platforms);
    game.physics.arcade.overlap(player, lollipops, collectLollipop, null, this);
    game.physics.arcade.overlap(player,enemy,enemyOverlap,null,this);
    moveEnemy();

};

Game.getCoordinates = function (layer,pointer) {
  Client.sendClick(pointer.worldX,pointer.worldY);
}
Game.addNewPlayer = function(id,x,y){
    Game.playerMap[id]= game.add.sprite(x,y,'dude');
    game.physics.arcade.enable(Game.playerMap[id]);
    Game.playerMap[id].body.bounce.y = 0.2;
    Game.playerMap[id].body.gravity.y = 300;
    Game.playerMap[id].body.bounce.y = 0.2;
    Game.playerMap[id].body.gravity.y = 300;
    Game.playerMap[id].body.collideWorldBounds = true;
    game.physics.arcade.collide(Game.playerMap[id], platforms);
    Game.playerMap[id].animations.add('left', [1, 2, 3, 4], 10, true);
    Game.playerMap[id].animations.add('right', [5, 6, 7, 8], 10, true);
    Game.playerMap[id].frame = 0;
    player = Game.playerMap[id];
};
Game.movePlayer = function(id){
  var player = Game.playerMap[id];
  /*var distance = Pasher.Math.distance(player.x,player.y,x,y);
  var tween = game.add.tween(player);
  var duration= distance*10;
  tween.to({x:x,y:y},duration);
  tween.start();*/
    if (cursors.left.isDown) {
        player.body.velocity.x = -150;
        player.animations.play('left');
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 150;
        player.animations.play('right');
    } else {
        player.animations.stop();
        player.frame = 4;
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
    }
};
Game.removePlayer = function(id){
  Game.playerMap[id].destroy();
  delete Game.playerMap[id];
};
function enemyOverlap(player,enemy){
    var live=lives.getFirstAlive();
    var sound=game.add.audio('enemyHit');
    sound.play();
    if(live){
        live.kill();
    }
    if(lives.countLiving()<1){
        sound=game.add.audio('gameOverSound');
        sound.play();
        gameState('Game Over! GG')
        //sound.stop();
    }
    if(enemy.body.x < game.world.width) {
        enemy.body.x = enemy.body.x + 250;
    }
    else{
        enemy.body.x = enemy.body.x + 250;
    }
}

function moveEnemy(){
    var movement;
    if(enemy.body.x<=1){
        movement=2;
    }
    if(enemy.body.x>=game.world.width-250){
        movement=1;
    }if(movement === 1){
        enemy.body.velocity.x = -100;
        enemy.animations.play('left');
    }
    else if(movement === 2){
        enemy.body.velocity.x = 100;
        enemy.animations.play('right');
    }
    else if(movement === 3){
        enemy.animations.stop();
        enemy.frame = 0;
    }
    setTimeout(function timeout(){}, 1000);
}

function collectLollipop (player, lollipop) {
    var sound;
    score += 10;
    scoreText.text = 'Score: ' + score;
    lollipop.kill();
    sound=game.add.audio('lollipopSound');
    sound.play();
    if( score>=120){
        sound=game.add.audio("youWin");
        sound.play();
        gameState('Congratulations !You are awesome');
    }
    //  sound.stop();
}

function gameState(msg){
    player.kill();
    enemy.kill();
    stateText.text=msg;
    stateText.visible = true;
    music.stop();
}
