
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var logging = false;
var tracking = false;

 var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
 		document.addEventListener('backbutton', backButtonPressed, false);
 		document.addEventListener('hidekeyboard', hidekeyboardPressed, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        if(tracking)
	        analytics.startTrackerWithId('XXXXXXXX') // replace XXXXXXXX by your tracking ID
	},
    // Update DOM on a Received Event
    receivedEvent: function(id) {

        console.log('Received Event: ' + id);
    }
};



// ---------------------------------------------------------------
//	Prevent exiting if back button is pressed in pause/shop screen
// ---------------------------------------------------------------

function backButtonPressed(e){
	if(pause_Group.y == 0 || shop_Group.y == 0){
		closeButtonPressed();
		e.preventDefault();
	}
	if(mightyButtonState == "open"){
		gameOver(false);
	}else if(mightyButtonState == "init"){
		navigator.app.exitApp();
	}
}
function hidekeyboardPressed(e){
	userInput.blur();
}


// ---------------------------------------------------------------
//		General settings for the game (includling the states)
// ---------------------------------------------------------------
var gameWidth = 540;
var gameHeight = 875;
var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render});
var scaleFactor;

// Here all different files are loaded (e.g. images, audios etc.)
function preload() {
	if(logging)
		console.log("Preload");
	if(tracking)
		analytics.trackView('Preload')

    game.load.image('appRate', 'img/appRate.png');	
    game.load.image('appRateButton', 'img/appRate1.png');	
    game.load.image('bg', 'img/bg.png');	
    game.load.image('clickMe', 'img/ClickMe.png');
    game.load.image('moreGames', 'img/moreGames.png');
    game.load.image('pauseButton', 'img/pause.png');
    game.load.image('plusButton', 'img/plus.png');
    game.load.image('minusButton', 'img/minus.png');
    game.load.image('shopButton', 'img/shop.png');
    game.load.image('backToGameButton', 'img/backToGame.png');
    game.load.image('closeButton', 'img/close.png');
    game.load.image('mightyButton', 'img/mightyButton.png');
    game.load.image('tutorial', 'img/tutorial.png');	
    game.load.image('tutorialShop', 'img/tutorial_Shop.png');	
    game.load.image('tutorialSettings', 'img/tutorial_Settings.png');	
	game.load.spritesheet('button', 'img/button.png', 192, 70);
	game.load.spritesheet('pointsCollection', 'img/points.png', 80, 98);
	game.load.spritesheet('checkbox', 'img/checkbox.png', 192, 70);
	game.load.spritesheet('badges', 'img/badges.png', 159, 273);
	game.load.spritesheet('specialCollection', 'img/specials.png', 101, 115);
	game.load.image('specialEmbedded', 'img/specialEmbedded.png');

	game.load.audio('archievement', 'sounds/Archievement.wav', true);
	game.load.audio('music', 'sounds/Music.mp3', true);


    preloadGame();

    game.physics.startSystem(Phaser.Physics.ARCADE);
	// resize your window to see everything
	game.scale.pageAlignHorizontally = true;
	game.scale.pageAlignVertically = true;
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.setScreenSize();

    scaleFactor = game.scale.width/gameWidth;

    game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
	game.scale.setUserScale(scaleFactor, scaleFactor, 0, 0);

	if(game.renderer == PIXI.CanvasRenderer)
		game.time.desiredFps = 60;
	//game.add.plugin(Phaser.Plugin.Debug);

	if(logging)
		console.log("/Preload");
}


// ---------------------------------------------------------------
//			All needed variables for clickMe environment
// ---------------------------------------------------------------

// the pointer is only needed by some games
var tmpPointer = new Phaser.Pointer(this.game, 3);

// this includes all upperGate objects
var upperGate_Group;
// this includes all lowerGate objects
var lowerGate_Group;
var mightyButton_Sprite;
// this group holds all hud Elements, that should appear after "opening"
var hud_Group;
var point0_Sprite;
var point1_Sprite;
var point2_Sprite;
var archievement_Sprite;
var mightyButtonState = "init";
var tutorial_Sprite;
var tutorialShop_Sprite;
var tutorialSettings_Sprite;

var points = 0;
var level = 0;

// this holds the enitre coins (is stored locally)
var coins = 0;
// this holds the current points until next coin (resets with each game)
var coin_Points;

// this group only contains the single letters for a text that has shifted letters
var text_Group;
var text_BG;

// rotation of the device
var rotation;
var fnRot = function(eventData){
					rotation = Phaser.Math.degToRad(eventData.gamma);
				};

// local storage for things like settings and tutorial
var localStorage = window.localStorage;
var startCounter;
var shopTutorialSeen;
var gameTutorialSeen;
var settingsTutorialSeen;
var currentVersion;

// data stored [0]=points [1]=name [2]=date
//stores 3 highscroes
var highscore;
var highscore_Texts = [];
var highscoreMarker_Text;
var highscoreCongrat_Text;

// prefs
var pause_Sound_Sprite;
var soundOn = true;
var pause_AppRate_Sprite;
var pause_Reset_Sprite;
var appRateOn = true;
var pause_Color_Sprite;
var colorOn = true;
var pause_Sensor_Sprite;
var sensorOn = false;
var changelogOn = false;


var highscore_Group;
var appRate_Group;
var changelog_Group;

// this includes everything visible in levels screen (if exists)
var levels_Group;
var levelsScreen_Group;
var levelsPtY;
var levelsPtYStart;
var levelsIsDragged = false;
var levelsDragStartTime;
var winEmitter;

var paused = false;
// this includes everything visible in pause screen
var pause_Group;
var pause_Sprite;
// this includes everything visible in shop screen
var shop_Group;
var shop_Sprite;
// this represents the amount of coins in the shop screen
var shopText_Acc;
// this blinks if a new coin was gained
var shop_CoinGainTxt;

// this group holds all the count labels (will also be used to know the amount of special items)
var specialLabels_Group;
// holds all special groups. Each special groups holds embedded-sprite and item (embedding=0; item=1)
var mySpecial_Groups = [];

// this holds 4 groups, each for each badge
var badges = [];

var yOffsetPerPx = 150/1080;
var desktop_HitField;

// sounds
var archievement_Audio;

var userInput = document.getElementById("userInput");
var userName = "Clicker";
window.onkeyup = function(e) {
		var keyCode = (e.keyCode ? e.keyCode : e.which);
		if(keyCode === 13 || keyCode == 10){
			userInput.blur();
		} 
	};

// this activates body rendering if implemented in renderGame();
var bugFound = false;

// sound
var music_Audio;


// ---------------------------------------------------------------
//			The initial function that creates the scene
// ---------------------------------------------------------------

function create() {
	if(logging)
		console.log("Create");

	if(!controls_alllowSensor)
		sensorOn = false;

	var bg = game.add.tileSprite(0, 0, gameWidth, gameHeight, 'bg');

	if(game.device.desktop)
		sensorOn = false;

	// load sounds
	music_Audio = game.add.audio('music');

	// load sounds
	archievement_Audio = game.add.audio('archievement');
	
	upperGate_Group = game.add.group();
	lowerGate_Group = game.add.group();
	hud_Group = game.add.group();
	text_Group = game.add.group();
	pause_Group = game.add.group();
	shop_Group = game.add.group();
	specialLabels_Group = game.add.group();
	badgeInfo_Group = game.add.group();
	appRate_Group = game.add.group();
	highscore_Group = game.add.group();
	levels_Group = game.add.group();
	changelog_Group = game.add.group();
	levelsScreen_Group = game.add.group();

	// -------------------------
	// create the pause screen
	{
		// add a new graphics object (polygon)
	    var pause_bg = game.add.graphics(0, 0);
		pause_bg.beginFill(0x000000);
		pause_bg.moveTo(0, 0);
		pause_bg.lineTo(game.world.width, 0);
		pause_bg.lineTo(game.world.width, game.world.height);
		pause_bg.lineTo(0, game.world.height);
		pause_bg.lineTo(0, 0);
		pause_bg.endFill();
		pause_bg.alpha = 0.8;
		pause_Group.add(pause_bg);

		// add the close button
		var close_Sprite = game.add.sprite(510, 25, 'closeButton', 0);
		close_Sprite.anchor.set(0.5);
		close_Sprite.scale.set(0.4);
		close_Sprite.inputEnabled = true;
		close_Sprite.events.onInputDown.add(closeButtonPressed, this);
		pause_Group.add(close_Sprite);

		var pauseText_HL = game.add.text(game.world.centerX, 40, "SETTINGS", {font: "50pt PoetsenOne-Regular", fill: "#CECECE"});
	    pauseText_HL.anchor.x = 0.5;
		pause_Group.add(pauseText_HL);

	    var pauseText_Prefs = game.add.text(80, 135, "Version:                            " + version + "\nSound:\nAppRate:\nColor:\nUser:\nReset:\n", {font: "21pt PoetsenOne-Regular", fill: "#CECECE"});
		if(controls_alllowSensor){
			pauseText_Prefs.setText(pauseText_Prefs.text + "Sensor:\n\n");
		}
		pauseText_Prefs.lineSpacing = 15;
		pause_Group.add(pauseText_Prefs);

		pause_Sound_Sprite = game.add.sprite(325, 188, 'checkbox', 0);
		if(!soundOn)
			pause_Sound_Sprite.frame = 3;
		pause_Sound_Sprite.scale.set(0.5);
		pause_Sound_Sprite.inputEnabled = true;
		pause_Sound_Sprite.animations.add('makeOff', [0,1,2,3]);
		pause_Sound_Sprite.animations.add('makeOn', [3,2,1,0]);
		pause_Sound_Sprite.events.onInputDown.add(function(){toggleSetting('sound');});
		pause_Group.add(pause_Sound_Sprite);

		pause_AppRate_Sprite = game.add.sprite(325, 241, 'checkbox', 0);
		if(!appRateOn)
			pause_Sound_Sprite.frame = 3;
		pause_AppRate_Sprite.scale.set(0.5);
		pause_AppRate_Sprite.inputEnabled = true;
		pause_AppRate_Sprite.animations.add('makeOff', [0,1,2,3]);
		pause_AppRate_Sprite.animations.add('makeOn', [3,2,1,0]);
		pause_AppRate_Sprite.events.onInputDown.add(function(){toggleSetting('appRate');});
		pause_Group.add(pause_AppRate_Sprite);

		pause_Color_Sprite = game.add.sprite(325, 294, 'checkbox', 0);
		if(!colorOn)
			pause_Color_Sprite.frame = 3;
		pause_Color_Sprite.scale.set(0.5);
		pause_Color_Sprite.inputEnabled = true;
		pause_Color_Sprite.animations.add('makeOff', [0,1,2,3]);
		pause_Color_Sprite.animations.add('makeOn', [3,2,1,0]);
		pause_Color_Sprite.events.onInputDown.add(function(){toggleSetting('color');});
		pause_Group.add(pause_Color_Sprite);

		userInput.style.left = (game.scale.offset.x + (325 * scaleFactor)) + "px";
		userInput.style.top = (game.scale.offset.y + (350 * scaleFactor)) + "px";
		userInput.style.width = (87 * scaleFactor) + "px";
		userInput.style.height = (25 * scaleFactor) + "px";
		userInput.style.MozBorderRadius = (20 * scaleFactor) + "px";
		userInput.style.borderRadius = (20 * scaleFactor) + "px";
		userInput.style.WebkitBorderRadius  = (20 * scaleFactor) + "px";
		userInput.style.fontSize = (20 * scaleFactor) + "px";

		pause_Reset_Sprite = game.add.sprite(325, 400, 'button', 0);
		pause_Reset_Sprite.scale.set(0.5);
		pause_Reset_Sprite.inputEnabled = true;
		pause_Reset_Sprite.animations.add('clicked', [0,1,2,3,3,2,1,0]);
		pause_Reset_Sprite.events.onInputDown.add(resetAll, this);
		pause_Group.add(pause_Reset_Sprite);

		if(controls_alllowSensor){
			pause_Sensor_Sprite = game.add.sprite(325, 459, 'checkbox', 0);
			if(!colorOn)
				pause_Sensor_Sprite.frame = 3;
			pause_Sensor_Sprite.scale.set(0.5);
			pause_Sensor_Sprite.inputEnabled = true;
			pause_Sensor_Sprite.animations.add('makeOff', [0,1,2,3]);
			pause_Sensor_Sprite.animations.add('makeOn', [3,2,1,0]);
			if(!game.device.desktop)
				pause_Sensor_Sprite.events.onInputDown.add(function(){toggleSetting('sensor');});
			pause_Group.add(pause_Sensor_Sprite);
		}

	    var line2 = game.add.text(game.world.centerX, 480, "____________________", {font: "30pt Arial", fill: "#676767"});
	    line2.anchor.x = 0.5;
		pause_Group.add(line2);

	    var pauseText_HL2 = game.add.text(game.world.centerX, 530, "CREDITS", {font: "28pt PoetsenOne-Regular", fill: "#CECECE"});
	    pauseText_HL2.anchor.x = 0.5;
		pause_Group.add(pauseText_HL2);

	    var pauseText_Credits1 = game.add.text(100, 580, credits1, {font: "11pt PoetsenOne-Regular", fill: "#CECECE"});
		pause_Group.add(pauseText_Credits1);

	    var pauseText_Credits2 = game.add.text(250, 580, credits2, {font: "11pt PoetsenOne-Regular", fill: "#CECECE"});
		pause_Group.add(pauseText_Credits2);

		var pause_MoreGames = game.add.sprite(game.world.centerX, 750, 'moreGames');
		pause_MoreGames.anchor.set(0.5);
		pause_MoreGames.scale.set(0.5);
		pause_MoreGames.inputEnabled = true;
		pause_MoreGames.events.onInputDown.add(moreGames, this);
		pause_Group.add(pause_MoreGames);

		pause_Group.y = game.world.height;
	}
	

	// -------------------------
	// create the pause screen
	if(hasLevels){
		// add a new graphics object (polygon)
	    var levels_bg = new Phaser.Graphics(game, 0, 0);
		levels_bg.beginFill(0x000000);
		levels_bg.moveTo(0, 0);
		levels_bg.lineTo(game.world.width, 0);
		levels_bg.lineTo(game.world.width, game.world.height);
		levels_bg.lineTo(0, game.world.height);
		levels_bg.lineTo(0, 0);
		levels_bg.endFill();
		var levels_bg_Sprite = game.add.sprite(0, 0, levels_bg.generateTexture());
		levelsScreen_Group.add(levels_bg_Sprite);

		var levelsScroll_Group = game.add.group();
		for(var l=0; l<TOTAL_LEVELS; ++l){
			var level_Group = game.add.group();

			var levelText = game.add.text(game.world.centerX, l*105 + 22, "Level " + (l+1), {font: "45pt PoetsenOne-Regular", fill: "#CECECE"});
		    levelText.anchor.x = 0.5;
			level_Group.add(levelText);				

		    var level_bg = new Phaser.Graphics(game, 0, 0);
			level_bg.beginFill(0xffffff);
			level_bg.moveTo(60, 0);
			level_bg.lineTo(game.world.width-60, 0);
			level_bg.lineTo(game.world.width-60, 80);
			level_bg.lineTo(60, 80);
			level_bg.lineTo(60, 0);
			level_bg.endFill();

			var level_bg_Sprite = game.add.sprite(60, l*105 + 20, level_bg.generateTexture());
			level_bg_Sprite.alpha = 0.2;

			level_bg_Sprite.inputEnabled = true;
			level_bg_Sprite.events.onInputDown.add(buildLevelCallback(l), this);

			level_bg_Sprite.input.enableDrag();
			level_bg_Sprite.input.allowVerticalDrag = false;
			level_bg_Sprite.input.allowHorizontalDrag = false;
			level_bg_Sprite.events.onDragStart.add(dragLevelsStarted, this);
			level_bg_Sprite.events.onDragStop.add(dragLevelsStopped, this);

			level_Group.add(level_bg_Sprite);

			levels_Group.add(level_Group);

			// is made visible in loadProfile
			level_Group.visible = false;
		}

		levels_bg_Sprite.alpha = 0.9;

		levelsScreen_Group.add(levels_Group);
		levelsScreen_Group.y = game.world.height;
	}


    // load local data
	loadSettings();
	
	createGame();

	// add my special box as part of the gui
	var mySpecial1_Group = game.add.group();
	var myBoxSpecial1Emb_Sprite = game.add.sprite(100, 650, 'specialEmbedded');
	myBoxSpecial1Emb_Sprite.anchor.set(0.5);
	myBoxSpecial1Emb_Sprite.scale.set(0.5);
	var myBoxSpecial1_Sprite = game.add.sprite(100, 650, 'specialCollection', 0);
	myBoxSpecial1_Sprite.anchor.set(0.5);
	myBoxSpecial1_Sprite.scale.set(0.5);
	mySpecial1_Group.add(myBoxSpecial1Emb_Sprite);
	mySpecial1_Group.add(myBoxSpecial1_Sprite);
	mySpecial1_Group.alpha = 0;
	mySpecial_Groups[0] = mySpecial1_Group;

	// add my special box as part of the gui
	var mySpecial2_Group = game.add.group();
	var mySpecial2Emb_Sprite = game.add.sprite(game.world.width-100, 650 - (game.world.width-100)*yOffsetPerPx, 'specialEmbedded');
	mySpecial2Emb_Sprite.anchor.set(0.5);
	mySpecial2Emb_Sprite.scale.set(0.5);
	var mySpecial2_Sprite = game.add.sprite(game.world.width-100, 650 - (game.world.width-100)*yOffsetPerPx, 'specialCollection', 1);
	mySpecial2_Sprite.anchor.set(0.5);
	mySpecial2_Sprite.scale.set(0.5);
	mySpecial2_Group.add(mySpecial2Emb_Sprite);
	mySpecial2_Group.add(mySpecial2_Sprite);
	mySpecial2_Group.alpha = 0;
	mySpecial_Groups[1] = mySpecial2_Group;

	// add a new graphics object (polygon)
    var lowerGate_backSh = game.add.graphics(0, 0);
	lowerGate_backSh.beginFill(0x000000);
	lowerGate_backSh.moveTo(0, game.world.height);
	lowerGate_backSh.lineTo(game.world.width, game.world.height);
	lowerGate_backSh.lineTo(game.world.width, 340);
	lowerGate_backSh.lineTo(0, 415);
	lowerGate_backSh.lineTo(0, 0);
	lowerGate_backSh.endFill();
	lowerGate_backSh.alpha = 0.2;

	// add a new graphics object (polygon)
    var upperGate_backSh = game.add.graphics(0, 0);
	upperGate_backSh.beginFill(0x000000);
	upperGate_backSh.moveTo(0, 0);
	upperGate_backSh.lineTo(game.world.width, 0);
	upperGate_backSh.lineTo(game.world.width, 360);
	upperGate_backSh.lineTo(0, 435);
	upperGate_backSh.lineTo(0, 0);
	upperGate_backSh.endFill();
	upperGate_backSh.alpha = 0.2;

	// add a new graphics object (polygon)
    var upperGate_back = new Phaser.Graphics(game, 0, 0);
	upperGate_back.beginFill(0xE5E5E5);
	upperGate_back.moveTo(0, 0);
	upperGate_back.lineTo(game.world.width, 0);
	upperGate_back.lineTo(game.world.width, 350);
	upperGate_back.lineTo(0, 425);
	upperGate_back.lineTo(0, 0);
	upperGate_back.endFill();
 
	// add the logo to the upperGate
	clickMe = game.add.sprite(game.world.centerX, game.world.centerY-250, 'clickMe');
	clickMe.anchor.set(0.5);
	clickMe.scale.set(0.5);
	
	// add a new graphics object (polygon)
    var lowerGate_back = new Phaser.Graphics(game, 0, 0);
	lowerGate_back.beginFill(0xF3F3F3);
	lowerGate_back.moveTo(0, game.world.height);
	lowerGate_back.lineTo(game.world.width, game.world.height);
	lowerGate_back.lineTo(game.world.width, 349);
	lowerGate_back.lineTo(0, 424);
	lowerGate_back.lineTo(0, 0);
	lowerGate_back.endFill();
	
	// add the points display
	point0_Sprite = game.add.sprite(40, 65, 'pointsCollection', 0);
	point0_Sprite.anchor.set(0.5);
	point0_Sprite.scale.set(0.4,0.55);
	point1_Sprite = game.add.sprite(75, 65 - 35*yOffsetPerPx, 'pointsCollection', 0);
	point1_Sprite.anchor.set(0.5);
	point1_Sprite.scale.set(0.4,0.55);
	point2_Sprite = game.add.sprite(110, 65 - 70*yOffsetPerPx, 'pointsCollection', 0);
	point2_Sprite.anchor.set(0.5);
	point2_Sprite.scale.set(0.4,0.55);

	// add the archievment notification
	archievement_Sprite = game.add.sprite(300, 45, 'badges', 0);
	archievement_Sprite.anchor.set(0.5);
	archievement_Sprite.scale.set(0.2);
	archievement_Sprite.angle = 30;
	archievement_Sprite.alpha = 0;

	
	// add the tutorial screen
	tutorial_Sprite = game.add.sprite(game.world.centerX, 375, 'tutorial');
	tutorial_Sprite.anchor.set(0.5);
	tutorial_Sprite.alpha = 0;
	tutorial_Sprite.scale.set(0.75);
	
	tutorialShop_Sprite = game.add.sprite(328, 145, 'tutorialShop');
	tutorialShop_Sprite.anchor.set(0.5);
	tutorialShop_Sprite.alpha = 0;
	tutorialShop_Sprite.scale.set(0.75);
	
	tutorialSettings_Sprite = game.add.sprite(359, 130, 'tutorialSettings');
	tutorialSettings_Sprite.anchor.set(0.5);
	tutorialSettings_Sprite.alpha = 0;
	tutorialSettings_Sprite.scale.set(0.75);
	
	// add the pause button
	pause_Sprite = game.add.sprite(510, 25, 'pauseButton', 0);
	pause_Sprite.anchor.set(0.5);
	pause_Sprite.scale.set(0.4);
	
	// add the shop button
	shop_Sprite = game.add.sprite(450, 25, 'shopButton', 0);
	shop_Sprite.anchor.set(0.5);
	shop_Sprite.scale.set(0.4);

	shop_CoinGainTxt = game.add.text(449, 26, "+", {font: "50pt Arial", fill: "#ffffff"});
	shop_CoinGainTxt.anchor.set(0.5);
	shop_CoinGainTxt.alpha = 0;

	if(hasLevels){
		winEmitter = game.add.emitter(game.world.centerX, -100, 100);
		winEmitter.width = game.world.width;
		winEmitter.setYSpeed(100, 200);
		winEmitter.setXSpeed(0, 0);
	    winEmitter.minParticleScale = 0.15;
	    winEmitter.maxParticleScale = 0.2;
	}

	// add the button to the lowerGate
	mightyButton_Sprite = game.add.sprite(game.world.centerX, game.world.centerY-35, 'mightyButton');
	mightyButton_Sprite.anchor.set(0.5);
	mightyButton_Sprite.scale.setTo(0.425,0.425);
	mightyButton_Sprite.inputEnabled = true;
	mightyButton_Sprite.events.onInputDown.add(mightyButtonPressed, this);
	if(!sensorOn){
		mightyButton_Sprite.input.enableDrag();
		mightyButton_Sprite.events.onDragStart.add(dragStarted, this);
		mightyButton_Sprite.events.onDragStop.add(dragStopped, this);

		mightyButton_Sprite.input.allowVerticalDrag = false;
		mightyButton_Sprite.input.allowHorizontalDrag = false;
	}
	mightyButton_Sprite.isMoving = false;	
	mightyButton_Sprite.xTmp = mightyButton_Sprite.x;
	mightyButton_Sprite.yTmp = mightyButton_Sprite.y;


	// add all things into groups
	upperGate_Group.add(upperGate_backSh);
	upperGate_Group.add(upperGate_back);
	upperGate_Group.add(clickMe);
	lowerGate_Group.add(lowerGate_backSh);
	lowerGate_Group.add(lowerGate_back);
	lowerGate_Group.add(mightyButton_Sprite);
	hud_Group.add(point0_Sprite);
	hud_Group.add(point1_Sprite);
	hud_Group.add(point2_Sprite);
	hud_Group.add(pause_Sprite);
	hud_Group.add(shop_Sprite);
	hud_Group.add(archievement_Sprite);
	hud_Group.add(shop_CoinGainTxt);

	createHUDGame();
		
	// hide shadows and hud
	upperGate_Group.getAt(0).visible = false;
	lowerGate_Group.getAt(0).visible = false;
	hud_Group.alpha = 0;


	text_BG = game.add.graphics(0, 0);
	text_BG.beginFill(0x000000);
	text_BG.moveTo(0, 0);
	text_BG.lineTo(game.world.width, -75);
	text_BG.lineTo(game.world.width, 75);
	text_BG.lineTo(0, 150);
	text_BG.lineTo(0, 0);
	text_BG.endFill();
	text_BG.alpha = 0;

	// -------------------------
	// create the shop screen
	{
		// add a new graphics object (polygon)
	    var pause_bg = game.add.graphics(0, 0);
		pause_bg.beginFill(0x000000);
		pause_bg.moveTo(0, 0);
		pause_bg.lineTo(game.world.width, 0);
		pause_bg.lineTo(game.world.width, game.world.height);
		pause_bg.lineTo(0, game.world.height);
		pause_bg.lineTo(0, 0);
		pause_bg.endFill();
		pause_bg.alpha = 0.8;
		shop_Group.add(pause_bg);

		// add the close button
		var close_Sprite = game.add.sprite(510, 25, 'closeButton', 0);
		close_Sprite.anchor.set(0.5);
		close_Sprite.scale.set(0.4);
		close_Sprite.inputEnabled = true;
		close_Sprite.events.onInputDown.add(closeButtonPressed, this);
		shop_Group.add(close_Sprite);

		var shopText_HL = game.add.text(game.world.centerX, 40, "SHOP", {font: "50pt PoetsenOne-Regular", fill: "#CECECE"});
	    shopText_HL.anchor.x = 0.5;
		shop_Group.add(shopText_HL);

	    shopText_Acc = game.add.text(game.world.centerX, 110, "-", {font: "37pt PoetsenOne-Regular", fill: "#CECECE"});
	    shopText_Acc.anchor.x = 0.5;
		shop_Group.add(shopText_Acc);

		// ---------------------------------------
		//			Special shop item
		// ---------------------------------------
	    var line1 = game.add.text(game.world.centerX, 150, "____________________", {font: "30pt Arial", fill: "#676767"});
	    line1.anchor.x = 0.5;
		shop_Group.add(line1);

	    var shopText_Special1_HL = game.add.text(game.world.centerX, 225, SPECIAL_NAMES[0] + " (" + SPECIAL_PRICES[0] + " Coins)", {font: "25pt PoetsenOne-Regular", fill: "#CECECE"});
	    shopText_Special1_HL.anchor.x = 0.5;	
		shop_Group.add(shopText_Special1_HL);

	    var shopText_Special1 = game.add.text(225, 300, "0", {font: "30pt PoetsenOne-Regular", fill: "#CECECE"});
	    specialLabels_Group.add(shopText_Special1);
		var special1_Sprite = game.add.sprite(150, 320, 'specialCollection', 0);
		special1_Sprite.anchor.set(0.5);
		special1_Sprite.scale.set(0.6);
		shop_Group.add(special1_Sprite);

		var special1_Minus = game.add.sprite(325, 315, 'minusButton', 0);
		special1_Minus.anchor.set(0.5);
		special1_Minus.scale.set(0.4);
		special1_Minus.inputEnabled = true;
		special1_Minus.events.onInputDown.add(function(){buyButtonPressed(-1, 0);}, this);
		shop_Group.add(special1_Minus);
		var special1_Plus = game.add.sprite(415, 315, 'plusButton', 0);
		special1_Plus.anchor.set(0.5);
		special1_Plus.scale.set(0.4);
		special1_Plus.inputEnabled = true;
		special1_Plus.events.onInputDown.add(function(){buyButtonPressed(1, 0);}, this);
		shop_Group.add(special1_Plus);


	    var line2 = game.add.text(game.world.centerX, 350, "____________________", {font: "30pt Arial", fill: "#676767"});
	    line2.anchor.x = 0.5;
		shop_Group.add(line2);

	    var shopText_Special2_HL = game.add.text(game.world.centerX, 425, SPECIAL_NAMES[1] + " (" + SPECIAL_PRICES[1] + " Coins)", {font: "25pt PoetsenOne-Regular", fill: "#CECECE"});
	    shopText_Special2_HL.anchor.x = 0.5;	
		shop_Group.add(shopText_Special2_HL);

	    var shopText_Special2 = game.add.text(225, 500, "0", {font: "30pt PoetsenOne-Regular", fill: "#CECECE"});
	    specialLabels_Group.add(shopText_Special2);
		var special2_Sprite = game.add.sprite(150, 520, 'specialCollection', 1);
		special2_Sprite.anchor.set(0.5);
		special2_Sprite.scale.set(0.6);
		shop_Group.add(special2_Sprite);

		var special2_Minus = game.add.sprite(325, 515, 'minusButton', 0);
		special2_Minus.anchor.set(0.5);
		special2_Minus.scale.set(0.4);
		special2_Minus.inputEnabled = true;
		special2_Minus.events.onInputDown.add(function(){buyButtonPressed(-1, 1);}, this);
		shop_Group.add(special2_Minus);
		var special2_Plus = game.add.sprite(415, 515, 'plusButton', 0);
		special2_Plus.anchor.set(0.5);
		special2_Plus.scale.set(0.4);
		special2_Plus.inputEnabled = true;
		special2_Plus.events.onInputDown.add(function(){buyButtonPressed(1, 1);}, this);
		shop_Group.add(special2_Plus);

		// add the backToGame button
		var bTG_Sprite = game.add.sprite(game.world.centerX, 750, 'backToGameButton');
		bTG_Sprite.anchor.set(0.5);
		bTG_Sprite.scale.set(0.5);
		bTG_Sprite.inputEnabled = true;
		bTG_Sprite.events.onInputDown.add(closeButtonPressed, this);
		shop_Group.add(bTG_Sprite);


		shop_Group.add(specialLabels_Group);
		shop_Group.y = game.world.height;
	}

/*
	// create tutorial
	var tutText = game.add.text(game.world.centerX, 600, "Tilt your device!\nThen, tap the round button!");
	tutText.align = 'center';
	tutText.font = 'ArchitectsDaughter';
	tutText.fontSize = 50;
    tutText.strokeThickness = 3;
    tutText.fill = '#000000';
    tutText.x = game.world.centerX - tutText.width/2;
    tutorial_Group = game.add.group();
    tutorial_Group.add(tutText);
   	tutorial_Group.alpha = 0;
*/


	// -------------------------
	// create the badges and info

	var step = 440/4;

	var badge0_Sprite = game.add.sprite(100, 600, 'badges', 0);
	badge0_Sprite.anchor.setTo(0.195, 0.121);
	badge0_Sprite.scale.setTo(0.5);
	badge0_Sprite.angle = 20 + game.rnd.integerInRange(0, 10);
	var duration = 400 + game.rnd.integerInRange(0, 100);
    game.add.tween(badge0_Sprite).to( { angle: 40 + game.rnd.integerInRange(0, 10)}, duration, Phaser.Easing.Quadratic.InOut, true, 0, Number.MAX_VALUE, true);
    badge0_Sprite.visible = false;
	badges[0] = badge0_Sprite;

	var badge1_Sprite = game.add.sprite(100+1*step, 600, 'badges', 1);
	badge1_Sprite.anchor.setTo(0.195, 0.121);
	badge1_Sprite.scale.setTo(0.5);
	badge1_Sprite.angle = 20 + game.rnd.integerInRange(0, 10);
	var duration = 400 + game.rnd.integerInRange(0, 100);
    game.add.tween(badge1_Sprite).to( { angle: 40 + game.rnd.integerInRange(0, 10)}, duration, Phaser.Easing.Quadratic.InOut, true, 0, Number.MAX_VALUE, true);
    badge1_Sprite.visible = false;
	badges[1] = badge1_Sprite;

	var badge2_Sprite = game.add.sprite(100+2*step, 600, 'badges', 2);
	badge2_Sprite.anchor.setTo(0.195, 0.121);
	badge2_Sprite.scale.setTo(0.5);
	badge2_Sprite.angle = 20 + game.rnd.integerInRange(0, 10);
	var duration = 400 + game.rnd.integerInRange(0, 100);
    game.add.tween(badge2_Sprite).to( { angle: 40 + game.rnd.integerInRange(0, 10)}, duration, Phaser.Easing.Quadratic.InOut, true, 0, Number.MAX_VALUE, true);
    badge2_Sprite.visible = false;
	badges[2] = badge2_Sprite;

	var badge3_Sprite = game.add.sprite(100+3*step, 600, 'badges', 3);
	badge3_Sprite.anchor.setTo(0.195, 0.121);
	badge3_Sprite.scale.setTo(0.5);
	badge3_Sprite.angle = 20 + game.rnd.integerInRange(0, 10);
	var duration = 400 + game.rnd.integerInRange(0, 100);
    game.add.tween(badge3_Sprite).to( { angle: 40 + game.rnd.integerInRange(0, 10)}, duration, Phaser.Easing.Quadratic.InOut, true, 0, Number.MAX_VALUE, true);
    badge3_Sprite.visible = false;
	badges[3] = badge3_Sprite;

    lowerGate_Group.add(badges[0]);
    lowerGate_Group.add(badges[1]);
    lowerGate_Group.add(badges[2]);
    lowerGate_Group.add(badges[3]);

	// add a new graphics object (polygon)
	var badgeInfo_bg = game.add.graphics(0, 0);
	badgeInfo_bg.beginFill(0x000000);
	badgeInfo_bg.moveTo(90, 775);
	badgeInfo_bg.lineTo(game.world.width-90, 775);
	badgeInfo_bg.lineTo(game.world.width-90, 875);
	badgeInfo_bg.lineTo(90, 875);
	badgeInfo_bg.lineTo(90, 775);
	badgeInfo_bg.endFill();
	badgeInfo_bg.alpha = 0.8;
	badgeInfo_Group.add(badgeInfo_bg);

	var badgeInfo_Invi = game.add.sprite(90, 775, badgeInfo_bg.generateTexture());
	badgeInfo_Invi.alpha = 0;
	badgeInfo_Invi.inputEnabled = true;
	badgeInfo_Invi.events.onInputDown.add(function(){hideBadgeInfo();}, this);

	var badgeInfo_Text = game.add.text(game.world.centerX, 825, "", {font: "25pt PoetsenOne-Regular", fill: "#CECECE"});
	badgeInfo_Text.anchor.setTo(0.5);
	badgeInfo_Group.add(badgeInfo_Text);

	badgeInfo_Group.y = 100;
    lowerGate_Group.add(badgeInfo_Group);


	// create the rate screen
	{
		var appRate_bgTrans = game.add.graphics(0, 0);
		appRate_bgTrans.beginFill(0x000000);
		appRate_bgTrans.moveTo(0, 0);
		appRate_bgTrans.lineTo(game.world.width, 0);
		appRate_bgTrans.lineTo(game.world.width, game.world.height);
		appRate_bgTrans.lineTo(0, game.world.height);
		appRate_bgTrans.lineTo(0, 0);
		appRate_bgTrans.endFill();
		appRate_bgTrans.alpha = 0.8;
		appRate_Group.add(appRate_bgTrans);

		var appRate_bg = game.add.graphics(0, 0);
		appRate_bg.beginFill(0x000000);
		appRate_bg.moveTo(50, 50);
		appRate_bg.lineTo(game.world.width-50, 50);
		appRate_bg.lineTo(game.world.width-50, 525);
		appRate_bg.lineTo(50, 525);
		appRate_bg.lineTo(50, 50);
		appRate_bg.endFill();
		appRate_bg.alpha = 0.8;
		appRate_Group.add(appRate_bg);

		var appRate_Text = game.add.text(75, 75, "You seem to like this app.\n\nPlease take a minute and\nrate the app in the store.", {font: "25pt PoetsenOne-Regular", fill: "#CECECE"});
		appRate_Group.add(appRate_Text);

		var appRate_Text1 = game.add.text(75, 475, "You can deactivate this in the settings.", {font: "16pt PoetsenOne-Regular", fill: "#CECECE"});
		appRate_Group.add(appRate_Text1);

		// add the close button
		var closeRate_Sprite = game.add.sprite(game.world.width-50, 50, 'closeButton');
		closeRate_Sprite.anchor.set(0.5);
		closeRate_Sprite.scale.set(0.4);
		closeRate_Sprite.inputEnabled = true;
		closeRate_Sprite.events.onInputDown.add(hideAppRate, this);
		appRate_Group.add(closeRate_Sprite);

		// add the rate stars
		var appRate_Sprite = game.add.sprite(game.world.centerX, 275, 'appRate');
		appRate_Sprite.anchor.set(0.5);
		appRate_Sprite.scale.set(0.4);
		appRate_Group.add(appRate_Sprite);

		// add the rate button
		var appRateButton_Sprite = game.add.sprite(game.world.centerX, 365, 'appRateButton');
		appRateButton_Sprite.anchor.set(0.5);
		appRateButton_Sprite.scale.set(0.4);
		appRateButton_Sprite.inputEnabled = true;
		appRateButton_Sprite.events.onInputDown.add(appRate, this);
		appRate_Group.add(appRateButton_Sprite);

		appRate_Group.visible = false;
	}
	// create the highscore screen
	{
		var highscore_bgTrans = game.add.graphics(0, 0);
		highscore_bgTrans.beginFill(0x000000);
		highscore_bgTrans.moveTo(0, 0);
		highscore_bgTrans.lineTo(game.world.width, 0);
		highscore_bgTrans.lineTo(game.world.width, game.world.height);
		highscore_bgTrans.lineTo(0, game.world.height);
		highscore_bgTrans.lineTo(0, 0);
		highscore_bgTrans.endFill();
		highscore_bgTrans.alpha = 0.8;
		highscore_Group.add(highscore_bgTrans);

		var highscore_bg = game.add.graphics(0, 0);
		highscore_bg.beginFill(0x000000);
		highscore_bg.moveTo(50, 50);
		highscore_bg.lineTo(game.world.width-50, 50);
		highscore_bg.lineTo(game.world.width-50, 525);
		highscore_bg.lineTo(50, 525);
		highscore_bg.lineTo(50, 50);
		highscore_bg.endFill();
		highscore_bg.alpha = 0.8;
		highscore_Group.add(highscore_bg);

		var highscoreText_HL = game.add.text(game.world.centerX, 75, "HIGHSCORE", {font: "50pt PoetsenOne-Regular", fill: "#CECECE"});
	    highscoreText_HL.anchor.x = 0.5;
		highscore_Group.add(highscoreText_HL);

		var highscoreP_Text = game.add.text(82, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
		highscore_Group.add(highscoreP_Text);
		highscore_Texts[0] = highscoreP_Text;
		var highscoreU_Text = game.add.text(165, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
		highscore_Group.add(highscoreU_Text);
		highscore_Texts[1] = highscoreU_Text;
		var highscoreD_Text = game.add.text(293, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
		highscore_Group.add(highscoreD_Text);
		highscore_Texts[2] = highscoreD_Text;

		highscoreMarker_Text = game.add.text(62, 175, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
		highscore_Group.add(highscoreMarker_Text);

		highscoreCongrat_Text = game.add.text(game.world.centerX, 425, "", {font: "26pt PoetsenOne-Regular", fill: "#CECECE"});
	    highscoreCongrat_Text.anchor.x = 0.5;
		highscore_Group.add(highscoreCongrat_Text);

		// add the close button
		var closeHighscore_Sprite = game.add.sprite(game.world.width-50, 50, 'closeButton');
		closeHighscore_Sprite.anchor.set(0.5);
		closeHighscore_Sprite.scale.set(0.4);
		closeHighscore_Sprite.inputEnabled = true;
		closeHighscore_Sprite.events.onInputDown.add(hideHighscore, this);
		highscore_Group.add(closeHighscore_Sprite);

		highscore_Group.visible = false;
	}
	// create the changelog screen
	{
		var changelog_bgTrans = game.add.graphics(0, 0);
		changelog_bgTrans.beginFill(0x000000);
		changelog_bgTrans.moveTo(0, 0);
		changelog_bgTrans.lineTo(game.world.width, 0);
		changelog_bgTrans.lineTo(game.world.width, game.world.height);
		changelog_bgTrans.lineTo(0, game.world.height);
		changelog_bgTrans.lineTo(0, 0);
		changelog_bgTrans.endFill();
		changelog_bgTrans.alpha = 0.8;
		changelog_Group.add(changelog_bgTrans);

		var changelog_bg = game.add.graphics(0, 0);
		changelog_bg.beginFill(0x000000);
		changelog_bg.moveTo(50, 50);
		changelog_bg.lineTo(game.world.width-50, 50);
		changelog_bg.lineTo(game.world.width-50, 700);
		changelog_bg.lineTo(50, 700);
		changelog_bg.lineTo(50, 50);
		changelog_bg.endFill();
		changelog_bg.alpha = 0.8;
		changelog_Group.add(changelog_bg);

		var changelogText_HL = game.add.text(game.world.centerX, 75, "CHANGELOG", {font: "50pt PoetsenOne-Regular", fill: "#CECECE"});
	    changelogText_HL.anchor.x = 0.5;
		changelog_Group.add(changelogText_HL);

		var changelog_Text = game.add.text(130, 195, "", {font: "24pt PoetsenOne-Regular", fill: "#CECECE"});
		for(var c=0; c<changelog.length; ++c){
			changelog_Text.text += changelog[c] + "\n\n";
		}
		changelog_Text.wordWrap = true;
		changelog_Text.wordWrapWidth = 300;
		changelog_Group.add(changelog_Text);

		// add the close button
		var closeChangelog_Sprite = game.add.sprite(game.world.width-50, 50, 'closeButton');
		closeChangelog_Sprite.anchor.set(0.5);
		closeChangelog_Sprite.scale.set(0.4);
		closeChangelog_Sprite.inputEnabled = true;
		closeChangelog_Sprite.events.onInputDown.add(hideChangelog, this);
		changelog_Group.add(closeChangelog_Sprite);

		changelog_Group.visible = false;
	}


	// replace gyro input with mouse on desktop
	if (game.device.desktop) {

		desktop_HitField = game.add.sprite(0, 75, badgeInfo_bg.generateTexture());
		desktop_HitField.height = 500;
		desktop_HitField.width = game.world.width;
		desktop_HitField.alpha = 0;
		desktop_HitField.inputEnabled = true;
		desktop_HitField.events.onInputDown.add(mightyButtonPressed, this);
		desktop_HitField.visible = false;
	}

	// load user profile
	loadProfile();

	game.world.bringToTop(tutorial_Sprite);
	game.world.bringToTop(upperGate_Group);
	game.world.bringToTop(lowerGate_Group);
	game.world.bringToTop(tutorialShop_Sprite);
	game.world.bringToTop(tutorialSettings_Sprite);
	game.world.bringToTop(hud_Group);
	game.world.bringToTop(appRate_Group);

	//navigator.splashscreen.hide();

	if(changelogOn) {
		changelogOn = false;
		showChangelog();
	}

	if(tracking)
		analytics.trackView('Start');

	if(logging)
		console.log("/Create");
}



// ---------------------------------------------------------------
//				This functions for handling dragging
// ---------------------------------------------------------------

function dragStarted(){
	if(!paused){
		if(logging)
			console.log("dragStarted");
		dragStartedGame();
	}else{
		mightyButton_Sprite.xTmp = mightyButton_Sprite.x;
		mightyButton_Sprite.yTmp = mightyButton_Sprite.y;
	}
}
function dragStopped(){
	if(!paused){
		if(logging)
			console.log("dragStopped");

		if((controls_ud || controls_lr) && !mightyButton_Sprite.isMoving){
			var xDiff = game.world.centerX - game.input.x;
			var yDiff = game.world.centerY+315 - game.input.y;

			if(Math.abs(xDiff) > Math.abs(yDiff) && controls_lr){
				mightyButton_Sprite.isMoving = true;
				if(xDiff < 0){
					game.add.tween(mightyButton_Sprite).to( { x:game.world.centerX+75 }, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
				}else{
					game.add.tween(mightyButton_Sprite).to( { x:game.world.centerX-75 }, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
				}
				setTimeout("mightyButton_Sprite.isMoving = false;", 401);
			}
			if(Math.abs(xDiff) < Math.abs(yDiff) && controls_ud){
				mightyButton_Sprite.isMoving = true;
				if(yDiff < 0){
					game.add.tween(mightyButton_Sprite).to( { y:game.world.centerY-35+75 }, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
				}else{
					game.add.tween(mightyButton_Sprite).to( { y:game.world.centerY-35-75 }, 200, Phaser.Easing.Quadratic.Out, true, 0, 0, true);
				}
				setTimeout("mightyButton_Sprite.isMoving = false;", 401);
			}

		}

		dragStoppedGame();
	}
}



// ---------------------------------------------------------------
//		This functions for handling dragging for levels
// ---------------------------------------------------------------

function dragLevelsStarted(){
	levelsPtY = game.input.y;
	levelsPtYStart = levelsPtY;
	levelsIsDragged = true;
	levelsDragStartTime = game.time.now;
}
function dragLevelsStopped(){
	levelsIsDragged = false;
	var dragTime = game.time.now - levelsDragStartTime;
	if(dragTime < 5000 && Math.abs(levelsPtYStart-game.input.y)<20){
		levelsScreen_Group.y = game.world.height;
		nextLevel();
	}
}



// ---------------------------------------------------------------
//				This function leads to my homepage
// ---------------------------------------------------------------

function moreGames(){
	if(tracking)
		analytics.trackEvent('Pause', 'MoreGames');

	window.open('http://www.softrabbit.de/ClickMe', '_system');
}



// ---------------------------------------------------------------
//				This function leads to app rating
// ---------------------------------------------------------------

function appRate(){
	if(tracking)
		analytics.trackEvent('AppRate', 'Rated');

	toggleSetting('appRate');
	window.open('http://play.google.com/store/apps/details?id=' + googlePlayAppId, '_system');
	appRate_Group.visible = false;
	hideAppRate();
}



// ---------------------------------------------------------------
//				This function resets the entire game
// ---------------------------------------------------------------

function resetAll(){
	if(logging)
		console.log("Reset");

	pause_Reset_Sprite.animations.play('clicked', 10, false);
	localStorage.clear();

    // load local data
	loadSettings();
	loadProfile();

	updateColorGame();

	gameOver(false);

	if(logging)
		console.log("/Reset");
}



// ---------------------------------------------------------------
//				This function loads local data settings
// ---------------------------------------------------------------

function loadSettings(){
	soundOn = localStorage.getItem("soundOn");
	if(soundOn == "false"){
		soundOn = false;
	}else{
		soundOn = true;
	}
	if(soundOn)
		pause_Sound_Sprite.frame = 0;
	else
		pause_Sound_Sprite.frame = 3;


	appRateOn = localStorage.getItem("appRateOn");
	if(appRateOn == "false"){
		appRateOn = false;
	}else{
		appRateOn = true;
	}
	if(appRateOn)
		pause_AppRate_Sprite.frame = 0;
	else
		pause_AppRate_Sprite.frame = 3;

	colorOn = localStorage.getItem("colorOn");
	if(colorOn == "false"){
		colorOn = false;
	}else{
		colorOn = true;
	}
	if(colorOn)
		pause_Color_Sprite.frame = 0;
	else
		pause_Color_Sprite.frame = 3;

	if(controls_alllowSensor){
		sensorOn = localStorage.getItem("sensorOn");
		if(sensorOn == "true"){
			sensorOn = true;
			// for mobile devices use gyro sensor
			if(!game.device.desktop){
				window.addEventListener('deviceorientation', fnRot);
			}
		}else{
			sensorOn = false;	
		}

		if(game.device.desktop)
			sensorOn = false;

		if(sensorOn)
			pause_Sensor_Sprite.frame = 0;
		else
			pause_Sensor_Sprite.frame = 3;
	}

	currentVersion = localStorage.getItem("currentVersion");
	if(currentVersion){
		if(currentVersion != version && changelog != ""){
			changelogOn = true;
			localStorage.setItem("currentVersion", version);
		}
	}
}


// ---------------------------------------------------------------
//				This function loads local data
// ---------------------------------------------------------------

function loadProfile(){
	if(hasLevels){
		levelsAvailable = parseInt(localStorage.getItem("levelsAvailable"));
		if(isNaN(levelsAvailable))
			levelsAvailable = 0;
	}

	coins = parseInt(localStorage.getItem("coins"));
	if(isNaN(coins))
		coins = 0;

	startCounter = localStorage.getItem("startCounter");

	if(startCounter){
		startCounter++;
		if(startCounter%4 == 3 && appRateOn){
			showAppRateNote();
		}
	}else{
		startCounter = 0;
	}
	localStorage.setItem("startCounter", startCounter);

	shopTutorialSeen = localStorage.getItem("shopTutorialSeen");
	if(!shopTutorialSeen){
		shopTutorialSeen = false;
	}

	gameTutorialSeen = localStorage.getItem("gameTutorialSeen");
	if(!gameTutorialSeen){
		gameTutorialSeen = false;
	}

	settingsTutorialSeen = localStorage.getItem("settingsTutorialSeen");
	if(!settingsTutorialSeen){
		settingsTutorialSeen = false;
	}

	if(localStorage.getItem("badge0")){
		badges[0].visible = true;

		badges[0].inputEnabled = true;
		badges[0].events.onInputDown.add(function(){showBadgeInfo(0);}, this);
	}else{
		badges[0].visible = false;
	}

	if(localStorage.getItem("badge1")){
		badges[1].visible = true;

		badges[1].inputEnabled = true;
		badges[1].events.onInputDown.add(function(){showBadgeInfo(1);}, this);
	}else{
		badges[1].visible = false;
	}

	if(localStorage.getItem("badge2")){
		badges[2].visible = true;

		badges[2].inputEnabled = true;
		badges[2].events.onInputDown.add(function(){showBadgeInfo(2);}, this);
	}else{
		badges[2].visible = false;
	}

	if(localStorage.getItem("badge3")){
		badges[3].visible = true;

		badges[3].inputEnabled = true;
		badges[3].events.onInputDown.add(function(){showBadgeInfo(3);}, this);
	}else{
		badges[3].visible = false;
	}

	userName = localStorage.getItem("userName")
	if(userName == null){
		userName = "Clicker";
	}
	userInput.value = userName;

	var highscoreTmp = localStorage["highscore"];
	if(highscoreTmp == null){
		highscore = [0, "Clicker", "-", 0, "Clicker", "-", 0, "Clicker", "-"];
	}else{
		highscore = JSON.parse(highscoreTmp);
	}
}



// ---------------------------------------------------------------
//				This function starts the next level
// 				it needs to reset any  game parameters
// ---------------------------------------------------------------

function nextLevel(){
	pauseGame();

	// just in case if finished before 6s
	tutorial_Sprite.alpha = 0;

	if(hasLevels){
		if(level>levelsAvailable){
			levelsAvailable = level;
			localStorage.setItem("levelsAvailable", levelsAvailable);
		}

		if(level == TOTAL_LEVELS){ // if hasLevels, last archievement is always "win"
			winGame();
			// archievement
			if(!badges[3].visible){
				earnArchievement(3);
			}
			winEmitter.makeParticles('mightyButton');
			winEmitter.start(false, 5000, 250);
			winEmitter.revive();
			setTimeout("gameOver(true); winEmitter.removeAll()", 7500);
			return;
		}
	}

	level++;

	text_BG.y = 300;


	var levelText = "LEVEL " + level;

	if(level == 1 && !badges[0].visible){
		earnArchievement(0);
		localStorage.setItem("gameTutorialSeen", true);
		gameTutorialSeen = true;
	}

	if(!gameTutorialSeen){
		if(hasLevels){
			levelsAvailable = 1;
			localStorage.setItem("levelsAvailable", levelsAvailable);
		}
		levelText = "TUTORIAL";
		setTimeout("tutorial_Sprite.alpha = 1;", 3000);
		setTimeout("tutorial_Sprite.alpha = 0;", 6000);
	}

	if(settingsTutorialSeen)
		hideForTutGame(2500);

	if(level == 1 && !settingsTutorialSeen){
		pauseGame();
		tutorialSettings_Sprite.alpha = 1;
		localStorage.setItem("settingsTutorialSeen", true);
		settingsTutorialSeen = true;
		hideForTutGame(3500);
		setTimeout("tutorialSettings_Sprite.alpha = 0;unpauseGame();", 3500);
	}

	text_Group.removeAll();
	writeText(levelText);
	text_Group.x = game.world.centerX - (levelText.length-1)*25;
	text_Group.y = 335;
	text_Group.alpha = 0;
	
	text_BG.alpha = 0.5;
	text_Group.alpha = 1;
	if(!paused)
		game.world.bringToTop(text_Group);
	game.add.tween(text_BG).to( { alpha:0 }, 500, Phaser.Easing.Linear.None, true, 2000);
	game.add.tween(text_Group).to( { alpha:0 }, 500, Phaser.Easing.Linear.None, true, 2000);

	setTimeout("unpauseGame()", 2500)

	if(level > 1){
		points += 10;
		coin_Points += 10;
		updatePoints();
	}

	mightyButton_Sprite.x = game.world.centerX;
	mightyButton_Sprite.y = game.world.centerY-35;

	nextLevelGame();
}



// ---------------------------------------------------------------
//			This function is called when a level is selected
// ---------------------------------------------------------------

function levelSelected(level_Para){
	level = level_Para;
	points = -10;
}



// ---------------------------------------------------------------
//				This function allows to write angled text
// ---------------------------------------------------------------

function writeText(textComplete){
	for(var j=0; j<textComplete.length; ++j){
	    var letter = game.add.text(0, -10-(j*50)*yOffsetPerPx, textComplete.substr(j,1));
	    letter.x = j*50;
	   // letter.align = 'center';
	   letter.anchor.x = 0.5;

	    //	Font style
	    letter.font = 'PoetsenOne-Regular';
	    letter.fontSize = 50;

	    //	Stroke color and thickness
	    letter.stroke = '#000000';
	    letter.strokeThickness = 3;
	    letter.fill = '#CECECE';
	    text_Group.add(letter);
	}
}



// ---------------------------------------------------------------
//		This function shows the badge info on the home screen
// ---------------------------------------------------------------
function showBadgeInfo(badgeNo){
	if(!paused){
		game.add.tween(badgeInfo_Group).to( { y:0 }, 500, Phaser.Easing.Bounce.Out, true);
		badgeInfo_Group.getAt(badgeInfo_Group.length-1).setText(badgeInfo[badgeNo]);
	}
}
// ---------------------------------------------------------------
//		This function shows the badge info on the home screen
// ---------------------------------------------------------------
function hideBadgeInfo(){
	game.add.tween(badgeInfo_Group).to( { y:200 }, 500, Phaser.Easing.Bounce.Out, true);
}



// ---------------------------------------------------------------
//		This function shows and safes an earned archievement
// ---------------------------------------------------------------

function earnArchievement(badgeNo){
	badges[badgeNo].visible = true;
	localStorage.setItem(("badge" + badgeNo), true);
	archievement_Sprite.frame = badgeNo;
	archievement_Sprite.alpha = 1;

	badges[badgeNo].inputEnabled = true;
	badges[badgeNo].events.onInputDown.add(function(){showBadgeInfo(badgeNo);}, this);

	game.add.tween(archievement_Sprite).to( { alpha:0 }, 500, Phaser.Easing.Linear.None, true);

	if(soundOn){
		archievement_Audio.play();
	}
}



// ---------------------------------------------------------------
//		This function has all calls if the button is pressed
// ---------------------------------------------------------------

function mightyButtonPressed() {
	if(!paused){
		// for the initial state
		if(mightyButtonState == "init") {

			if(logging)
				console.log("INIT");
			if(tracking)
				analytics.trackView('Game');


			if(game.device.desktop)
				desktop_HitField.visible = true;

			var lowerGate = game.add.tween(lowerGate_Group);
			lowerGate.to({y:350}, 1500, Phaser.Easing.Bounce.Out);
			lowerGate.start();

			var raiseGate = game.add.tween(upperGate_Group);
			raiseGate.to({y:-300}, 1500, Phaser.Easing.Bounce.Out);
			raiseGate.start();
			
			// show shadows
			upperGate_Group.getAt(0).visible = true;
			lowerGate_Group.getAt(0).visible = true;
			
			// show hud
			game.add.tween(hud_Group).to( { alpha: 1 }, 1500, Phaser.Easing.Linear.None, true, 1500);			

			// Reset level and points
			points = 0;
			coin_Points = 0;
			updatePoints();

			// prevents that it is clickable althoug not being visible
			pause_Sprite.inputEnabled = true;
			pause_Sprite.events.onInputDown.add(pauseButtonPressed, this);
			shop_Sprite.inputEnabled = true;
			shop_Sprite.events.onInputDown.add(shopButtonPressed, this);

			if(badges[0].visible == false){
				level = -1;
			}else{
				level = 0;
			}

			for(var i=0; i<mySpecial_Groups.length; ++i){
				var mySpecial = mySpecial_Groups[i].getAt(1);
				mySpecial.inputEnabled = true;
				mySpecial.events.onInputDown.add(buildSpecialCallback(i), this);
			}

			mightyButtonPressedGame();
            setTimeout( "mightyButtonState = 'open';", 1500);
				
			if(soundOn){
				music_Audio.play('',0,1,true,false);
			}

			if(hasLevels && gameTutorialSeen){
				pauseGame();
				levelsScreen_Group.y = 0;
				
				for(var l=0; l<levelsAvailable+1; ++l){
					levels_Group.getAt(l).visible = true;
				}

				var levels_bg_Sprite = levelsScreen_Group.getAt(0);
				levels_bg_Sprite.height = levels_Group.height + 40;
				if(levels_bg_Sprite.height < game.world.height)
					levels_bg_Sprite.height = game.world.height;

				game.world.bringToTop(levelsScreen_Group);
			}else{
				// create first level
				setTimeout("nextLevel();", 1000);
			}

		} else if(mightyButtonState == "open") {
			if(logging)
				console.log("MIGHTY");

			mightyButtonPressedGame();

			if(logging)
				console.log("/MIGHTY");
		}
	}
}



// ---------------------------------------------------------------
//		This function builds the callback for each loop-iteration
// ---------------------------------------------------------------

function buildSpecialCallback(idx) {
    return function() {
        specialButtonPressed(idx);
    };
}
function buildLevelCallback(level) {
    return function() {
        levelSelected(level);
    };
}



// ---------------------------------------------------------------
//		This function is always called by phaser on repaint
// ---------------------------------------------------------------

function update() {
	if(!sensorOn && mightyButton_Sprite.input.isDragged && controls_alllowSensor){
		rotation = game.physics.arcade.angleToPointer(pointer_Sprite) + Math.PI/2;
	}

	if(controls_llrr && mightyButtonState == "open"){
		if(mightyButton_Sprite.x < 0)
			mightyButton_Sprite.x = 0;
		if(mightyButton_Sprite.x > game.world.width)
			mightyButton_Sprite.x = game.world.width;

		if(!paused){
			if(mightyButton_Sprite.input.isDragged){
				mightyButton_Sprite.x = game.input.x;
				mightyButton_Sprite.y = game.world.centerY-35 - yOffsetPerPx * (mightyButton_Sprite.x -  game.world.centerX);
			}
		}else{
			mightyButton_Sprite.x = mightyButton_Sprite.xTmp;
			mightyButton_Sprite.y = mightyButton_Sprite.yTmp;
		}
	}

	if(levelsIsDragged){
		var yDiff = levelsPtY - game.input.y;
		levelsPtY = game.input.y;
		if(yDiff > 0 && levelsScreen_Group.y > game.world.height - (levels_Group.height+40))
			levelsScreen_Group.y -= yDiff;
		if(yDiff < 0 && levelsScreen_Group.y < 0)
			levelsScreen_Group.y -= yDiff;

		if(levelsScreen_Group.y < game.world.height - (levels_Group.height+40))
			levelsScreen_Group.y = game.world.height - (levels_Group.height+40);
		if(levelsScreen_Group.y > 0)
			levelsScreen_Group.y = 0;

	}

	updateGame();
}



// ---------------------------------------------------------------
//		This function is called if the last line has a box
// ---------------------------------------------------------------

function gameOver(showScore){
	if(tracking)
		analytics.trackEvent('GameOver', '' + points + '');

	music_Audio.stop();

	if(showScore)
		postHighScore();

	var lowerGate = game.add.tween(lowerGate_Group);
	lowerGate.to({y:0}, 1500, Phaser.Easing.Bounce.Out);
	lowerGate.start();

	var raiseGate = game.add.tween(upperGate_Group);
	raiseGate.to({y:0}, 1500, Phaser.Easing.Bounce.Out);
	raiseGate.start();
	
	// hide shadows
	upperGate_Group.getAt(0).visible = false;
	lowerGate_Group.getAt(0).visible = false;
	
	// hide hud
	hud_Group.alpha = 0;

	mightyButtonState = "init";

	// prevents that it is clickable althoug not being visible
	pause_Sprite.inputEnabled = false;
	shop_Sprite.inputEnabled = false;

	for(var i=0; i<mySpecial_Groups.length; ++i){
		mySpecial_Groups[i].inputEnabled = false;
		mySpecial_Groups[i].alpha = 0;
	}

	game.add.tween(mightyButton_Sprite).to( {x: game.world.centerX, y: game.world.centerY-35}, 1000, Phaser.Easing.Quadratic.In, true);

	gameOverGame();
}



// ---------------------------------------------------------------
// 				This function updates the points
// ---------------------------------------------------------------

function updatePoints(){
	if(coin_Points >= 10){
		coins += Math.floor(coin_Points/10);
		localStorage.setItem("coins", coins);
		coin_Points %= 10;

		shop_CoinGainTxt.alpha = 0.7;
		game.add.tween(shop_CoinGainTxt).to( { alpha:0 }, 500, Phaser.Easing.Linear.None, true);
	}

	point0_Sprite.frame = Math.floor(points / 100);
	point1_Sprite.frame = Math.floor((points%100) / 10);
	point2_Sprite.frame = points % 10;

	// archievement
	if(!badges[2].visible){
		if(points >= ARCHIEVEMENT_POINTS)
			earnArchievement(2);
	}
	if(points > 9 && !shopTutorialSeen){
		pauseGame();
		tutorialShop_Sprite.alpha = 1;
		localStorage.setItem("shopTutorialSeen", true);
		shopTutorialSeen = true;
		hideForTutGame(3500);
		setTimeout("tutorialShop_Sprite.alpha = 0;unpauseGame();", 3500)
	}
}



// ---------------------------------------------------------------
// 				This shows the pause screen
// ---------------------------------------------------------------

function pauseButtonPressed(){
	if(tracking)
		analytics.trackEvent('HUDButton', 'Pause');

	pauseGame();
	pause_Group.y = 0;
	game.world.bringToTop(pause_Group);
	userInput.style.visibility = "visible";

	pauseButtonPressedGame();
}



// ---------------------------------------------------------------
// 				This closes the pause screen
// ---------------------------------------------------------------

function closeButtonPressed(){
	unpauseGame();
	pause_Group.y = game.world.height;
	shop_Group.y = game.world.height;
	userInput.style.visibility = "hidden";
	userName = userInput.value.substring(0,7);
	userInput.value = userName;
	localStorage.setItem("userName", userName);

	closeButtonPressedGame();
}



// ---------------------------------------------------------------
// 				This buy/sell special items
// ---------------------------------------------------------------

function buyButtonPressed(amount, item){
	if(tracking)
		analytics.trackEvent('Shop', '' + item + '');

	var label = specialLabels_Group.getAt(item);
	var amountCurrent = parseInt(label.text);
	var price = amount*SPECIAL_PRICES[item];

	// only if money is available and amount always is >0 (in terms of selling)
	if(price <= coins && amountCurrent+amount >= 0){
		amountCurrent += amount;
		label.setText(amountCurrent);
		coins -= price;
		updateAccText();
		if(amountCurrent>0)	
			mySpecial_Groups[item].alpha = 1;
		else
			mySpecial_Groups[item].alpha = 0;
		localStorage.setItem("coins", coins);
	}
}
function updateAccText(){
	if(coins == 1)
		shopText_Acc.setText(coins + " Coin");
	else
		shopText_Acc.setText(coins + " Coins");
}



// ---------------------------------------------------------------
// 				This toggles the preferences on/off
// ---------------------------------------------------------------

function toggleSetting(setting){
	if(logging)
		console.log("TOGGLE(" + setting + ")");
	if(tracking)
		analytics.trackEvent('Pause', '' + setting + '');

	if(setting == 'sound'){
		if(soundOn){
			pause_Sound_Sprite.animations.play('makeOff', 20, false);
			soundOn = false;
			music_Audio.stop();
		}else{
			pause_Sound_Sprite.animations.play('makeOn', 20, false);
			soundOn = true;
			music_Audio.play('',0,1,true,false);
		}
		localStorage.setItem("soundOn", soundOn);
	}
	if(setting == 'appRate'){
		if(appRateOn){
			pause_AppRate_Sprite.animations.play('makeOff', 20, false);
			appRateOn = false;
		}else{
			pause_AppRate_Sprite.animations.play('makeOn', 20, false);
			appRateOn = true;
		}
		localStorage.setItem("appRateOn", appRateOn);
	}
	if(setting == 'color'){
		if(colorOn){
			pause_Color_Sprite.animations.play('makeOff', 20, false);
			colorOn = false;
		}else{
			pause_Color_Sprite.animations.play('makeOn', 20, false);
			colorOn = true;
		}
		localStorage.setItem("colorOn", colorOn);
		updateColorGame();
	}
	if(setting == 'sensor'){
		if(sensorOn){
			pause_Sensor_Sprite.animations.play('makeOff', 20, false);
			sensorOn = false;
			mightyButton_Sprite.input.enableDrag();
			mightyButton_Sprite.events.onDragStart.add(dragStarted, this);
			mightyButton_Sprite.events.onDragStop.add(dragStopped, this);

			if(controls_orientation){
				mightyButton_Sprite.input.allowVerticalDrag = false;
				mightyButton_Sprite.input.allowHorizontalDrag = false;
			}

			if(!game.device.desktop){
				window.removeEventListener('deviceorientation', fnRot);
			}
		}else{
			pause_Sensor_Sprite.animations.play('makeOn', 20, false);
			sensorOn = true;
			mightyButton_Sprite.input.disableDrag();

			if(!controls_orientation){
				game.add.tween(mightyButton_Sprite).to( {x: game.world.centerX, y: game.world.centerY-385}, 1000, Phaser.Easing.Quadratic.In, true);	
			}

			if(!game.device.desktop){
				window.addEventListener('deviceorientation', fnRot);
			}
		}
		localStorage.setItem("sensorOn", sensorOn);
	}

	if(logging)
		console.log("/TOGGLE(" + setting + ")");
}



// ---------------------------------------------------------------
// 				This shows the pause screen
// ---------------------------------------------------------------

function shopButtonPressed(){
	if(tracking)
		analytics.trackEvent('HUDButton', 'Shop');

	pauseGame();
	updateAccText();
	shop_Group.y = 0;
	game.world.bringToTop(shop_Group);

	shopButtonPressedGame();
}



// ---------------------------------------------------------------
// 				This shows/hides the appRate screen
// ---------------------------------------------------------------

function showAppRateNote(){
	game.world.bringToTop(appRate_Group);
	appRate_Group.visible = true;
	pauseGame();
}
function hideAppRate(){
	appRate_Group.visible = false;
	unpauseGame();
}



// ---------------------------------------------------------------
// 				This shows/hides the highscore
// ---------------------------------------------------------------

function showHighscore(){
	game.world.bringToTop(highscore_Group);
	var score0 = ('000000000' + highscore[0]).substr(-3); 
	var score1 = ('000000000' + highscore[3]).substr(-3); 
	var score2 = ('000000000' + highscore[6]).substr(-3); 
	highscore_Texts[0].text = "\n" + score0 + "\n" + score1 + "\n" + score2;
	highscore_Texts[1].text = "\n" + highscore[1] + "\n" + highscore[4] + "\n" + highscore[7];
	highscore_Texts[2].text = "\n" + highscore[2] + "\n" + highscore[5] + "\n" + highscore[8];

	highscore_Group.visible = true;
	pauseGame();
}
function hideHighscore(){
	highscore_Group.visible = false;
	unpauseGame();
}



// ---------------------------------------------------------------
// 				This shows/hides the changelog
// ---------------------------------------------------------------

function showChangelog(){
	game.world.bringToTop(changelog_Group);
	changelog_Group.visible = true;
	pauseGame();
}
function hideChangelog(){
	changelog_Group.visible = false;
	unpauseGame();
}



// ---------------------------------------------------------------
//					Needed for clay.io services
// ---------------------------------------------------------------
/*
connectToGameServices();
// connects to clay.io server via ajax
function connectToGameServices(){
    var Clay = Clay || {};
    Clay.gameKey = clayName;
    Clay.readyFunctions = [];
    Clay.ready = function( fn ) {
        Clay.readyFunctions.push( fn );
    };
    ( function() {
        var clay = document.createElement("script"); clay.async = true;
        clay.src = ( "https:" == document.location.protocol ? "https://" : "http://" ) + "clay.io/api/api.js"; 
        var tag = document.getElementsByTagName("script")[0]; tag.parentNode.insertBefore(clay, tag);
    } )();
}

// allows to post a highscore even without loggingg in
function postHighScore(){
	leaderboard = new Clay.Leaderboard( { id: leaderBoard_ID } );
	var options = {
	    score: points,
	    name: 'testUser'
	    // you can pass hideUI as well if you don't want the score posted notification to show
	    // , hideUI: true
	}
	leaderboard.post( options, function( response ) {
	    // Callback
	    console.log( response );
	} );

    var options = {
        recent: 3600, // Optional, to limit scores to ones posted in last x seconds
        sort: 'asc', // Optional, sorting by "asc" will show the lowest scores first (ex. for fastest times)
        filter: ['day', 'month'], // Optional, Array of filters to narrow down high scores
        cumulative: false, // Optional, if set to true grabs the sum of all scores for each player
        best: false, // Optional, if set to true grabs the best score from each player
        limit: 10, // Optional, how many scores to show (0 for all). Default is 10
        self: false, // Optional, Boolean if set to true shows just the scores of the player viewing
        friends: false, // Optional, Boolean if set to true shows just the scores of the player viewing AND their Clay.io friends
        showPersonal: true // Optional, Boolean on if the player's stats (rank & high score) should show below the name. Default is false
    };
    var callback = function( response ) { // Optional
        console.log( response );
    };
    leaderboard.show( options, callback );
}
*/
function postHighScore(){
	var date = new Date();

	if(points > highscore[0]){
		highscoreMarker_Text.alpha = 1;
		highscore = [points, userName, date.toLocaleDateString("en-US"), highscore[0], highscore[1], highscore[2], highscore[3], highscore[4], highscore[5]];
		highscoreMarker_Text.text = "\n>                                                       <";
		game.add.tween(highscoreMarker_Text).to( { alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 4, true);
		highscoreCongrat_Text.text = "New Highscore";
	}else if(points > highscore[3]){
		highscoreMarker_Text.alpha = 1;
		highscore = [highscore[0], highscore[1], highscore[2], points, userName, date.toLocaleDateString("en-US"), highscore[3], highscore[4], highscore[5]];
		highscoreMarker_Text.text = "\n\n>                                                       <";
		game.add.tween(highscoreMarker_Text).to( { alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 4, true);
		highscoreCongrat_Text.text = "Very Good";
	}else if(points > highscore[6]){
		highscoreMarker_Text.alpha = 1;
		highscore[6] = points;
		highscore[7] = userName;
		highscore[8] = date.toLocaleDateString("en-US");
		highscoreMarker_Text.text = "\n\n\n>                                                       <";
		game.add.tween(highscoreMarker_Text).to( { alpha: 0}, 1000, Phaser.Easing.Linear.None, true, 0, 4, true);
		highscoreCongrat_Text.text = "Good";
	}else{
		highscoreMarker_Text.text = "";		
		highscoreCongrat_Text.text = "Not Good Enough";
	}

	localStorage.setItem("highscore", JSON.stringify(highscore));

	showHighscore();
}



// ---------------------------------------------------------------
// 			This switches the upcoming item to special
// ---------------------------------------------------------------

function specialButtonPressed(item){
	if(tracking)
		analytics.trackEvent('InGame', 'SpecialSelected');

	if(itemPlayableGame(item)){
		var amount = parseInt(specialLabels_Group.getAt(item).text);
		if(amount > 0){
			amount--;
			specialLabels_Group.getAt(item).setText(amount);
			if(amount <= 0)
				mySpecial_Groups[item].alpha = 0;

			specialButtonPressedGame(item);
		}
	}
}



// ---------------------------------------------------------------
// 					This function is for debugging
// ---------------------------------------------------------------

function render() {
	renderGame();
}