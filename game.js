/* vim: set ai ts=8 sw=2 sts=2 et: */
enchant();

window.onload = function () {
  var game = new Game(640, 400);

  game.preload(
    'assets/start.png',
    'assets/game-over.png',
    'assets/the-end.png',
    'assets/entities/smallblock.png',
    'assets/entities/blocks.json',
    'assets/entities/rock.png',
    'assets/mansion-tileset.png', 
    'assets/player/bunnysprite.png',
    'assets/player/gorillasprite.png',
    'assets/player/mousesprite.png',
    'assets/player/person.png',
    'assets/player/mouse.png',
    'assets/player/gorilla.png',
    'assets/player/alien.png',
    'assets/player/ghost.png',
    'assets/music/spooky.mp3',
    'assets/sounds/falling.wav',
    'assets/sounds/rustle.wav',
    'assets/sounds/stairs.wav',
    'assets/sounds/break.wav',
    'assets/map.json'
  );

  game.onload = function () {
    sbimage = game.assets['assets/entities/smallblock.png'];
    lbimage = game.assets['assets/entities/rock.png'];

    start();

    function start() {
      var scene = new Scene();
      scene.addChild(game.assets['assets/start.png']);
      game.pushScene(scene);
      var started = false;
      scene.addEventListener(Event.INPUT_START, next);
      scene.addEventListener(Event.TOUCH_END, next);
      function next() {
        if (!started) {
          started = true;
          game.popScene(scene);
          begin();
        }
      }
    }

    function end() {
      var scene = new Scene();
      scene.addChild(game.assets['assets/game-over.png']);
      game.pushScene(scene);
      scene.addEventListener(Event.INPUT_START, function () {
        location.reload(false);
      });
    }

    function win() {
      var scene = new Scene();
      scene.addChild(game.assets['assets/the-end.png']);
      game.pushScene(scene);
    }

    function begin() {
      game.bgm = game.assets['assets/music/spooky.mp3'];
      game.bgm.play();
      setInterval(function () {
        game.bgm.play();
      }, 88000);
      var tmap = Tiled.Parse(game.assets['assets/map.json'], 
                             game.assets['assets/mansion-tileset.png']);
      EntityParser(game.assets['assets/entities/blocks.json'], tmap);
      tmap.setLevel(0);
      var costumes = [
        new Sprite(48, 64),
        new Sprite(32, 32),
        new Sprite(96, 96)
      ];
      costumes[0].image = game.assets['assets/player/bunnysprite.png'];
      costumes[0].speed = 5;
      costumes[0].colbox = {
        width: 36,
        height: 36
      };
      costumes[1].image = game.assets['assets/player/mousesprite.png'];
      costumes[1].speed = 3;
      costumes[1].colbox = {
        width: 16,
        height: 16
      };
      costumes[2].image = game.assets['assets/player/gorillasprite.png'];
      costumes[2].speed = 1;
      costumes[2].colbox = {
        width: 48,
        height: 48
      };

      var state = new State(game, tmap, costumes);

      game.addEventListener(Event.ENTER_FRAME, function () {
        state.update();
      });
      game.addEventListener(Event.RIGHT_BUTTON_DOWN, function () {
        if (state.playable) {
          state.rightStart();
        }
      });
      game.addEventListener(Event.RIGHT_BUTTON_UP, function () {
        if (state.playable) {
          state.rightEnd();
        }
      });
      game.addEventListener(Event.LEFT_BUTTON_DOWN, function () {
        if (state.playable) {
          state.leftStart();
        }
      });
      game.addEventListener(Event.LEFT_BUTTON_UP, function () {
        if (state.playable) {
          state.leftEnd();
        }
      });
      game.addEventListener(Event.UP_BUTTON_DOWN, function () {
        if (state.playable) {
          state.upStart();
        }
      });
      game.addEventListener(Event.UP_BUTTON_UP, function () {
        if (state.playable) {
          state.upEnd();
        }
      });
      game.addEventListener(Event.DOWN_BUTTON_DOWN, function () {
        if (state.playable) {
          state.downStart();
        }
      });
      game.addEventListener(Event.DOWN_BUTTON_UP, function () {
        if (state.playable) {
          state.downEnd();
        }
      });
      game.addEventListener(Event.A_BUTTON_UP, function (e) {
        state.changeCostumes();
      });

      state.onend = function () {
        game.popScene();
        end();
      };

      state.onwin = function () {
        game.popScene();
        win();
      };
    }
  };
  game.fps = 60;
  game.keybind(65, 'left');
  game.keybind(68, 'right');
  game.keybind(87, 'up');
  game.keybind(83, 'down');
  game.keybind(16, 'a');
  game.keybind(32, 'a');
  game.start();
};
