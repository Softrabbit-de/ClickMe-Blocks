// ---------------------------------------------------------------
//					Needed for clay.io services
// ---------------------------------------------------------------

// individual id and name for each game
// var leaderBoard_ID = 4652;
// var clayName = "clickmenshoot";
// var leaderboard;



// ---------------------------------------------------------------
//			All needed variables for clickMe environment
// ---------------------------------------------------------------

// this array assigns each special item a price ... needed for each game individually
var SPECIAL_PRICES = [7,8];
var SPECIAL_NAMES = ["Round-House-Box", "Line-Breaker-Box"];
var ARCHIEVEMENT_POINTS = 250;

// this describes the four badges
var badgeInfo = ["You earned this for...\nbeating the tutorial.", "You earned this for...\n7 falling blocks.", "You earned this for...\ngetting " + ARCHIEVEMENT_POINTS + "Pts.", "You earned this for...\nblack blocks."];

var version = "1.05";
var googlePlayAppId = "com.softrabbit.clickMe";

var hasLevels = false;
var levelsAvailable = 0;
var TOTAL_LEVELS = -1;

var changelog = ["back button fixed", "bug fixes"];

var credits1 = "Graphics\nFonts\n\nSounds";
var credits2 = "made by Freepik.com\nPoetsenOne-Regular\nArchitectsDaughter\nEric (www.soundimage.org)";

// ---------------------------------------------------------------
// 			These variables define the controls in the game
// ---------------------------------------------------------------
// evaluate the orientation sensor
var controls_orientation = true;

// allows to drag and drop the button along a line
var controls_llrr = false;

// allows to swype the button up,down
var controls_ud = false;
// allows to swype the button left,right
var controls_lr = false;

// if phone orientation is allowed at all
var controls_alllowSensor = true;




// ---------------------------------------------------------------
//			The initial function that loads stuff
// ---------------------------------------------------------------

function preloadGame() {
	if(logging)
		console.log("PreloadGame");

	game.load.audio('hit', 'sounds/Hit.wav', true);
	game.load.spritesheet('boxCollection1', 'img/boxes.png', 101, 115);
	game.load.spritesheet('boxCollection0', 'img/boxesGray.png', 101, 115);
    game.load.image('pointer', 'img/pointer.png');
    game.load.image('warningLine', 'img/warningLine.png');

	if(logging)
		console.log("/PreloadGame");
}



// ---------------------------------------------------------------
//			The initial function that creates the scene
// ---------------------------------------------------------------

function createGame() {
	if(logging)
		console.log("CreateGame");

	// load sounds
	if(!game.device.desktop){
		hit_Audio_Cor = new Media("file:///android_asset/www/sounds/Hit.wav", null, null);
	}else{
		hit_Audio = game.add.audio('hit');
	}

	// add pointer in the back
	pointer_Sprite = game.add.sprite(game.world.centerX, game.world.centerY+300, 'pointer');
	pointer_Sprite.anchor.set(0.5, 1.3);
	pointer_Sprite.scale.set(0.5);
	pointer_Sprite.alpha = 0;

	// draw warning line
	warningLine_Sprite = game.add.sprite(0, 495, 'warningLine');
	warningLine_Sprite.alpha = 0.1;

	// shootingboxes
	shootingBox_Sprite = game.add.sprite(0, 0, 'boxCollection' + Number(colorOn), 0);
	shootingBox_Sprite.anchor.set(0.5);
	shootingBox_Sprite.scale.set(0.5);
	//shootingBox_Sprite.scale.set(0.4, 0.5); //hack to scale the body
    shootingBox_Sprite.enableBody = true;
	game.physics.enable(shootingBox_Sprite, Phaser.Physics.ARCADE);
	shootingBox_Sprite.body.collideWorldBounds = true;
	shootingBox_Sprite.body.bounce.x = 1;
	shootingBox_Sprite.kill();

	// this includes all the boxes to shoot at
	targets_Group = game.add.group();
    targets_Group.physicsBodyType = Phaser.Physics.ARCADE;
	// this includes all the boxes to build the top ceiling
	ceilingBox_Group = game.add.group();
    ceilingBox_Group.physicsBodyType = Phaser.Physics.ARCADE;
	// all falling boxes after successfull hit
	fallingBox_Group = game.add.group();
	fallingBox_Group.alpha = 0.5;

	// create gray line as a ceiling
	for(var i=0; i<13; ++i) {
		var xOffset = -12;
		var x = xOffset + i*50;
		var y = starting_Block - x*yOffsetPerPx;
		var ceilingBox = game.add.sprite(x, y, 'boxCollection' + Number(colorOn), 0);
		ceilingBox.anchor.set(0.5);
		ceilingBox.scale.set(0.5);
		ceilingBox_Group.add(ceilingBox);
		ceilingBox_Group.enableBody = true;
		game.physics.enable(ceilingBox, Phaser.Physics.ARCADE);
		ceilingBox.body.immovable = true;
		ceilingBox.tint = 0x000000;
		ceilingBox.alpha = 0.25;
	}

	// create the grid for the entire game
	for(var j=0; j<fieldHeight +1; ++j) { // the +1 means the already-game-over state
		for(var i=0; i<fieldWidth; ++i) {
			var xOffset = 67;
			if(j%2 == 1) xOffset = 35;
			var x = xOffset + i*62;
			var y = (starting_Real) + j*55 - x*yOffsetPerPx;
			var targetBox = game.add.sprite(x, y, 'boxCollection' + Number(colorOn), 0);
			targetBox.anchor.set(0.5);
			targetBox.scale.set(0.5);
			targets_Group.add(targetBox);
			targetBox.enableBody = true;
			game.physics.enable(targetBox, Phaser.Physics.ARCADE);
			targetBox.body.immovable = true;
			targetBox.kill();
		}
	}
	
	targets_Group.alpha = 0;

	// particle emitter for exploding boxes
	emitter = game.add.emitter(0, 0, 100);
	emitter.makeParticles('boxCollection' + Number(colorOn), 0);
    emitter.setScale(0.5, 0, 0.5, 0, 1000);
	emitter.setAlpha(0.3, 0.5);
	emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);

//game.time.slowMotion = 3.0;

	if(logging)
		console.log("/CreateGame");
}



// ---------------------------------------------------------------
//		The initial function that creates the HUD elements
// ---------------------------------------------------------------

function createHUDGame(){
	if(logging)
		console.log("CreateHUDGame");

	// add my preview box as part of the gui
	var myBox_SpriteBorder = game.add.sprite(175, 50, 'boxCollection' + Number(colorOn), 0);
	myBox_SpriteBorder.anchor.set(0.5);
	myBox_SpriteBorder.tint = 0x000000;
	myBox_SpriteBorder.scale.set(0.55);
	myBox_Sprite = game.add.sprite(175, 50, 'boxCollection' + Number(colorOn), 3);
	myBox_Sprite.anchor.set(0.5);
	myBox_Sprite.scale.set(0.5);

	// additional hud elements
	hud_Group.add(myBox_SpriteBorder);
	hud_Group.add(myBox_Sprite);

	if(logging)
		console.log("/CreateHUDGame");
}



// ---------------------------------------------------------------
//				This function starts the next level
// 				it needs to reset any  game parameters
// ---------------------------------------------------------------

function nextLevelGame(){

	if(level == 1 || level == 2)
		colorCount++;

	// change game specific parameters
	shootCounter = 0;
	if(level != 0){
		// add colors in every second level
		if(level%3==0 && startLines < 6)
			startLines++;
		if((level%3==1 && colorCount<TOTAL_TARGET_COLORS)){
			colorCount++;
			if(level != 1)
				startLines--;
		}
		if(level%8==4 && shootsTilLine > 1)
			shootsTilLine--;
		if(level%11==10 && blackStones < 3){

			// archievement
			if(!badges[3].visible){
				earnArchievement(3);
			}

			blackStones++;
			shootsTilLine++;
		}
	}

	bigOffsetAtTop = true;

	// create a new level
	for(var j=0; j<colorCount; ++j)
		colors_Left[j] = 0;
	// create dummy lines
	for(var j=0; j<fieldHeight; ++j) {
		for(var i=0; i<fieldWidth; ++i) {
			var idx = j*fieldWidth + i;

			var xOffset = 67;
			if(j%2 == 1) xOffset = 35;
			var x = xOffset + i*62;
			var y = (starting_Real) + j*55 - x*yOffsetPerPx;
			targets_Group.getAt(idx).x = x;
			targets_Group.getAt(idx).y = y;

			if(j<startLines){
				var blackDecision = game.rnd.integerInRange(0, 6);
				targets_Group.getAt(idx).loadTexture('boxCollection' + Number(colorOn));
				if(blackDecision <= 6-blackStones)
					targets_Group.getAt(idx).frame = getValidColor(true);
				else
					targets_Group.getAt(idx).frame = 0;

				targets_Group.getAt(j*fieldWidth+i).revive();
			}
		}
	}

	// if we still have a color that is no longer available -> change it
    if(colors_Left[currentShootingBox - 1] <= 0 || currentShootingBox == 0){
		currentShootingBox = getValidColor(false, true);
		myBox_Sprite.frame = currentShootingBox;
    }
}



// ---------------------------------------------------------------
//		This function has all calls if the button is pressed
// ---------------------------------------------------------------

function mightyButtonPressedGame() {
	// for the initial state
	if(mightyButtonState == "init") {
		if(logging)
			console.log("INITGame");

		game.add.tween(pointer_Sprite).to( { alpha: 1 }, 1500, Phaser.Easing.Linear.None, true, 1500);
		
		// reset all gaming parameters
		blackStones = 0;
		shootsTilLine = 4;
		colorCount = 0;
		startLines = 2;

		shootCounterTmp = 0;
		bigOffsetAtTop = true;

		// works like a timer
		nextShoot = game.time.now + 1500;
		
		// show targets
		targets_Group.alpha = 1;

		for(var j=0; j<fieldHeight+1; ++j) {
			for(var i=0; i<fieldWidth; ++i) {
				var idx = j*fieldWidth + i;
				
				var xOffset = 67;
				if(j%2 == 1) xOffset = 35;
				var x = xOffset + i*62;
				var y = (starting_Real) + j*55 - x*yOffsetPerPx;
				targets_Group.getAt(idx).x = x;
				targets_Group.getAt(idx).y = y;

				targets_Group.getAt(idx).frame = 0;
				targets_Group.getAt(idx).kill();
			}
		}

		currentShootingBox = 0;
		myBox_Sprite.frame = 0;

		if(logging)
			console.log("/INITGame");
	} else if(mightyButtonState == "open") {
		if(sensorOn){
			shoot();
		}
	}
}



// ---------------------------------------------------------------
//		This function is always called by phaser on repaint
// ---------------------------------------------------------------

function updateGame(){
	if(!paused){
		if(rotation < -Math.PI/3) rotation = -Math.PI/3;
		if(rotation > Math.PI/3) rotation = Math.PI/3;
		pointer_Sprite.rotation = rotation;
	}

	// here we connect the shooting boxes and the targets
	game.physics.arcade.collide(shootingBox_Sprite, targets_Group, collisionHandlerGame, null, this);
	game.physics.arcade.collide(shootingBox_Sprite, ceilingBox_Group, collisionHandlerGame, null, this);
}



// ---------------------------------------------------------------
//		This function is called after official game over
// ---------------------------------------------------------------

function gameOverGame(){
		pointer_Sprite.alpha = 0;
}



// ---------------------------------------------------------------
// 			This switches the upcoming item to special
// ---------------------------------------------------------------

function specialButtonPressedGame(item){
	currentShootingBox = item;
	myBox_Sprite.loadTexture('specialCollection');
	myBox_Sprite.frame = currentShootingBox;
}



// ---------------------------------------------------------------
//		This function is the listener for collisions
// ---------------------------------------------------------------

function collisionHandlerGame(shootingBox, targetBox) {
	if (!shootingBox.hasCollided) {
		shootingBox.hasCollided = true;

		if(logging)
			console.log("collisionHandlerGame([" + (shootingBox.body.x+shootingBox.body.halfWidth) + "," + (shootingBox.body.y+shootingBox.body.halfHeight) + "], [" + (targetBox.body.x+targetBox.body.halfWidth) + "," + (targetBox.body.y+targetBox.body.halfHeight) + "])");

		shootingBox.body.velocity.x = 0;
		shootingBox.body.velocity.y = 0;
		//shootingBox.x = shootingBox.body.x + shootingBox.body.halfWidth*0.5;
		//shootingBox.y = shootingBox.body.y + shootingBox.body.halfHeight*0.5;

		if(soundOn){
			if(game.device.desktop){
				hit_Audio.play();
			}else{
				hit_Audio_Cor.play();
			}
		}

		var x = shootingBox.body.x + shootingBox.body.halfWidth;
		var y = shootingBox.body.y + shootingBox.body.halfHeight;
		var offY = x*yOffsetPerPx; // this calculates the offset, more accurate would be tan(8)
		var posY = Math.round((y-starting_Real + offY) / 55);//Math.floor((y-starting_Real + offY) / 110);
		var xOffset = 35;
		if (posY%2 != bigOffsetAtTop)
			xOffset = 67;
		var posX = Math.round((x -xOffset) / 62);

		// check bounds
		if(posX >= fieldWidth) posX = fieldWidth-1;
		if(posX < 0) posX = 0;

		// calculate correct pixel position in grid
		var newX = xOffset + posX * 62;
		var newY = starting_Real + posY*55 - newX*yOffsetPerPx;

		// This should never happen
		if(targets_Group.getAt(fieldWidth*posY + posX).alive){

		// for debug
		//bugFound = true;
		//alert('bugFound: ' + posX + "," + posY);
			console.log("Wrong Pos! " + posX + "," + posY);
			var alternative = false;
			var offset = -1;
			if(targets_Group.getAt(posY*fieldWidth).x == 67){
				offset = 0;
			}
			if(posY < fieldHeight){
				if(!targets_Group.getAt((posY+1)*fieldWidth + (posX+offset)).alive && !alternative){
					alternative = true;
					posY++; posX += offset;
				}
				if(!targets_Group.getAt((posY+1)*fieldWidth + (posX+offset+1)).alive && !alternative){
					alternative = true;
					posY++; posX += offset+1;
				}
			}
			if(posY > 0){
				if(!targets_Group.getAt((posY-1)*fieldWidth + (posX+offset)).alive && !alternative){
					alternative = true;
					posY--; posX += offset;
				}
				if(!targets_Group.getAt((posY-1)*fieldWidth + (posX+offset+1)).alive && !alternative){
					alternative = true;
					posY--; posX += offset+1;
				}
			}
			if(posX > 0){
				if(!targets_Group.getAt((posY)*fieldWidth + (posX-1)).alive && !alternative){
					alternative = true;
					posX--;
				}		
			}
			if(posX < fieldWidth-1){
				if(!targets_Group.getAt((posY)*fieldWidth + (posX+1)).alive && !alternative){
					alternative = true;
					posX++;
				}		
			}

//return;
			if(!alternative){
				console.log("No Alternative found ... ");
				shootingBox.kill();
				return;
			}else{
				xOffset = 35;
				if (posY%2!=bigOffsetAtTop)
					xOffset = 67;
				newX = xOffset + posX * 62;
				newY = starting_Real + posY*55 - newX*yOffsetPerPx;
				console.log("Alternative at " + posX + "," + posY);
			}
		}

 		// get the associated targetbox, move it to shootingbox and tween back to position
 		var idealBox = targets_Group.getAt(fieldWidth*posY + posX);
 		idealBox.loadTexture(shootingBox.key);
		idealBox.frame = shootingBox.frame;
		colors_Left[shootingBox.frame - 1]++;
		idealBox.anchor.set(0.5);
		idealBox.scale.set(0.5);
		idealBox.reset(x, y);
		game.physics.enable(idealBox, Phaser.Physics.ARCADE);
		idealBox.body.immovable = true;
 		
 		shootingBox.kill();
		game.add.tween(idealBox).to({ y: newY, x: newX}, 50, Phaser.Easing.Linear.None, true);

		// check for removing boxes after hit
		if(idealBox.key == 'specialCollection' && idealBox.frame == 0){ // round-house
			setTimeout("eraseNeighbors(" + posX + "," + posY + ")", 200);
		}
		if(idealBox.key == 'specialCollection' && idealBox.frame == 1){ // line breaker
			setTimeout("eraseLine(" + posY + ")", 200);
		}
		if(idealBox.key == ('boxCollection'+Number(colorOn)) && idealBox.frame > 0){
			setTimeout("checkSimilarities(" + posX + "," + posY + "," + idealBox.frame + ")", 200);
		}

		if(logging)
			console.log("/collisionHandlerGame");
	}
}



// ---------------------------------------------------------------
// 				This toggles the preferences on/off
// ---------------------------------------------------------------

function updateColorGame(){
	for(var i=0; i<targets_Group.length; ++i){
		var tmp = targets_Group.getAt(i).frame;
		targets_Group.getAt(i).loadTexture('boxCollection' + Number(colorOn));
		targets_Group.getAt(i).frame = tmp;
	}
	myBox_Sprite.loadTexture('boxCollection' + Number(colorOn));
	myBox_Sprite.frame = currentShootingBox;
}



// ---------------------------------------------------------------
// 				This is called while dragging
// ---------------------------------------------------------------

function dragStartedGame(){
}
function dragStoppedGame(){
	shoot();
}



// ---------------------------------------------------------------
// 			This is called when the pause screen is shown
// ---------------------------------------------------------------

function pauseButtonPressedGame(){
}



// ---------------------------------------------------------------
// 			This is called when the shop screen is shown
// ---------------------------------------------------------------

function shopButtonPressedGame(){
}



// ---------------------------------------------------------------
// 		This is called when the close button is pressed
// ---------------------------------------------------------------

function closeButtonPressedGame(){
}



// ---------------------------------------------------------------
// 			This is called when a tutorial is shown
// ---------------------------------------------------------------

function hideForTutGame(time){
	targets_Group.alpha = 0.2;
	setTimeout("continueAfterTuTScreen()", time);
}
function continueAfterTuTScreen(){
	targets_Group.alpha = 1;
}



// ---------------------------------------------------------------
// 			This is called when the game is paused
// ---------------------------------------------------------------

function pauseGame(){
	paused = true;
}
function unpauseGame(){
	paused = false;
}



// ---------------------------------------------------------------
// 			This is called when the game is paused
// ---------------------------------------------------------------

function winGame(){
}



// ---------------------------------------------------------------
// 			This checks if special is playable now
// ---------------------------------------------------------------

function itemPlayableGame(item){
	return true;
}



// ---------------------------------------------------------------
// 			This does rendering features (display debug)
// ---------------------------------------------------------------

function renderGame(){
	if(bugFound){
		for(var i=0;i<targets_Group.length;i++){
			if(targets_Group.getAt(i).alive)
			game.debug.body(targets_Group.getAt(i));
		}
		game.debug.body(shootingBox_Sprite);
	}
}