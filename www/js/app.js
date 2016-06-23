// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }


        /* Scale the game size for high resolution devices - store this value globally
         * Image assets should be 3x larger than they need to be, then they will be scaled down
         * according to the scale ratio (i.e an iPhone 5 with a DPR of 2 will have a scale ratio
         * of 2 / 3 which is 0.66..., so the image will be scaled down by one third which is what we want)
         */
        var height = window.innerHeight
        var width = window.innerWidth

        //Create a new game instance and assign it to the 'gameArea' div
        game = new Phaser.Game(width, height, Phaser.AUTO, 'gameArea',{ preload: preload, create: create, update: update });

        function preload() {

          game.load.image('sky', 'img/sky.png');
          game.load.image('ground', 'img/platform.png');
          game.load.image('bms', 'img/bms-icon.png');
          game.load.image('business', 'img/business-icon.png');
          game.load.image('marketing', 'img/marketing-icon.png');
          game.load.image('development', 'img/development-icon.png');
          game.load.image('design', 'img/design-icon.png');
          game.load.spritesheet('dude', 'img/dude.png', 32, 48);


        }

        var player;
        var platforms;
        var cursors;

        var stars;
        var score = 0;
        var scoreText;
        var ground;
        var toRemove = [];
        function create() {

            //  We're going to be using physics, so enable the Arcade Physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

            //  A simple background for our game
            game.add.sprite(0, 0, 'sky');

            //  The platforms group contains the ground and the 2 ledges we can jump on
            platforms = game.add.group();

            //  We will enable physics for any object that is created in this group
            platforms.enableBody = true;

            // Here we create the ground.
            ground = platforms.create(0, game.world.height - 30, 'ground');

            //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
            var ratioWidth = getRatio(400, 100, width);

            ground.scale.setTo(ratioWidth, 1);
            //  This stops it from falling away when you jump on it
            ground.body.immovable = true;

            //  Now let's create two ledges
            var ledge = platforms.create(game.world.width*0.6, game.world.height*0.8, 'ground');
            ratioWidth = getRatio(400, 40, width);
            ledge.scale.setTo(ratioWidth, 1);
            ledge.body.immovable = true;
            toRemove.push(ledge);

            ledge = platforms.create(0, game.world.height*0.6, 'ground');
            ledge.scale.setTo(ratioWidth, 1);
            ledge.body.immovable = true;
            toRemove.push(ledge);

            ledge = platforms.create(game.world.width*0.6, game.world.height*0.4, 'ground');
            ledge.scale.setTo(ratioWidth, 1);
            ledge.body.immovable = true;
            toRemove.push(ledge);

            ledge = platforms.create(0, game.world.height*0.2, 'ground');
            ledge.scale.setTo(ratioWidth, 1);
            ledge.body.immovable = true;
            toRemove.push(ledge);

            // The player and its settings
            player = game.add.sprite(32, game.world.height - game.world.height*0.4, 'dude');

            //  We need to enable physics on the player
            game.physics.arcade.enable(player);

            //  Player physics properties. Give the little guy a slight bounce.
            player.body.bounce.y = 0.2;
            player.body.gravity.y = 300;
            player.body.collideWorldBounds = true;

            //  Our two animations, walking left and right.
            player.animations.add('left', [0, 1, 2, 3], 10, true);
            player.animations.add('right', [5, 6, 7, 8], 10, true);

            //  Finally some stars to collect
            stars = game.add.group();

            //  We will enable physics for any star that is created in this group
            stars.enableBody = true;

            var marketing = stars.create(game.world.width*0.2, 0, 'marketing');
            marketing.body.gravity.y = 300;
            marketing.body.bounce.y = 0.5 + Math.random() * 0.2;
            marketing.scale.setTo(0.45,0.45);
            marketing.name = "Marketing";

            var development = stars.create(game.world.width - game.world.width*0.2, game.world.height*0.2, 'development');
            development.body.gravity.y = 300;
            development.body.bounce.y = 0.7 + Math.random() * 0.2;
            development.name = "Software Development";

            var business = stars.create(game.world.width*0.2, game.world.height*0.3, 'business');
            business.body.gravity.y = 300;
            business.body.bounce.y = 0.2;
            business.scale.setTo(0.45,0.45);
            business.name = "Business Development";

            var design = stars.create(game.world.width - game.world.width*0.2, game.world.height*0.5, 'design');
            design.body.gravity.y = 300;
            design.body.bounce.y = 0.7 + Math.random() * 0.2;
            design.scale.setTo(0.45,0.45);
            design.name = "Design";

            //  The score
            scoreText = game.add.text(16, 16, '', { fontSize: '32px', fill: '#000' });

            //  Our controls.
            //cursors = game.input.keyboard.createCursorKeys();
            game.input.touch.enabled = true;
            
        }

        function update() {
            //  Collide the player and the stars with the platforms
            game.physics.arcade.collide(player, platforms);
            game.physics.arcade.collide(stars, platforms);

            //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
            game.physics.arcade.overlap(player, stars, collectStar, null, this);

            //  Reset the players velocity (movement)
            //player.body.velocity.x = 0;

            player.body.velocity.x = 0;
            if (game.input.pointer1.isDown){  
                var deltaX = game.input.activePointer.position.x -  game.input.activePointer.positionDown.x;
                var deltaMove = 50;
                if(deltaX > deltaMove){
                    player.body.velocity.x = deltaX;
                    player.animations.play('right');
                }else if (deltaX < -deltaMove){
                    player.body.velocity.x = deltaX;
                    player.animations.play('left');

                }else{
                    player.body.velocity.x = 0;
                    player.animations.stop();
                    player.frame = 4;
                }
            }
            if (game.input.pointer2.isDown){  
                    player.body.velocity.y = -game.world.height*0.4;
            }

        }

        function collectStar (player, star) {
            // Removes the star from the screen
            star.kill();

            //  Add and update the score
            score += 10;
            scoreText.text =  star.name;
            if (score == 40){
                scoreText.text = "Contact BMS";
                var bms = stars.create(game.world.width - 130, game.world.height - game.world.height *0.5, 'bms');
                bms.body.gravity.y = 300;
                bms.body.bounce.y = 0.7 + Math.random() * 0.2;
                toRemove.forEach(function(member, param1) {    
                  member.kill();  
                });
            }
            if (score == 50 ){
                window.open('http://www.businessonmarketst.com/', '_system', 'location=yes');
            }

        }
        function getRatio( elementAttr, percentage, totalAttr){
            return (totalAttr * percentage) / elementAttr / 100;
        }
 


  });
})
