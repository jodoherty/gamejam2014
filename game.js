/* vim: set ai ts=8 sw=2 sts=2 et: */
enchant();

window.onload = function () {
  var game = new Game(640, 400);

  game.preload('assets/mansion-tileset.png', 
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
    game.bgm = game.assets['assets/music/spooky.mp3'];
    game.bgm.play();
    var tmap = Tiled.Parse(game.assets['assets/map.json'], 
                           game.assets['assets/mansion-tileset.png']);
    tmap.setLevel(0);
    var costumes = [
      new Sprite(48, 64),
      new Sprite(32, 32),
      new Sprite(96, 96),
      new Sprite(48, 48),
      new Sprite(48, 48)
    ];
    costumes[0].image = game.assets['assets/player/person.png'];
    costumes[0].speed = 5;
    costumes[0].colbox = {
      width: 36,
      height: 36
    };
    costumes[1].image = game.assets['assets/player/mouse.png'];
    costumes[1].speed = 3;
    costumes[1].colbox = {
      width: 16,
      height: 16
    };
    costumes[2].image = game.assets['assets/player/gorilla.png'];
    costumes[2].speed = 1;
    costumes[2].colbox = {
      width: 48,
      height: 48
    };
    costumes[3].image = game.assets['assets/player/alien.png'];
    costumes[3].speed = 2;
    costumes[3].colbox = {
      width: 84,
      height: 84
    };
    costumes[4].image = game.assets['assets/player/ghost.png'];
    costumes[4].speed = 2;
    costumes[4].colbox = {
      width: 48,
      height: 48
    };

    var state = new State(game, tmap, costumes);

    game.addEventListener(Event.ENTER_FRAME, function () {
      state.update();
      if (game.bgm.currentTime >= game.bgm.duration) {
        game.bgm.play();
      }
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
  };
  game.fps = 60;
  game.keybind(65, 'left');
  game.keybind(68, 'right');
  game.keybind(87, 'up');
  game.keybind(83, 'down');
  game.keybind(16, 'a');
  game.start();
};
