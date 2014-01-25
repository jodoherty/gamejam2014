/* vim: set ai ts=8 sw=2 sts=2 et: */
enchant();

window.onload = function () {
  var game = new Game(640, 400);

  game.preload('assets/mansion-tileset.png', 
    'assets/sewer-tileset.png', 
    'assets/player/person.png',
    'assets/player/mouse.png',
    'assets/player/gorilla.png',
    'assets/player/alien.png',
    'assets/player/ghost.png',
    'assets/first-floor.json',
    'assets/Masion Tile Set.png'
  );

  game.onload = function () {
    var tmap = Tiled.Parse(game.assets['assets/first-floor.json'], 
                           game.assets['assets/Masion Tile Set.png']);
    tmap.setLevel(0);
    var costumes = [
      new Sprite(48, 48),
      new Sprite(16, 16),
      new Sprite(72, 72),
      new Sprite(48, 48),
      new Sprite(48, 48)
    ];
    costumes[0].image = game.assets['assets/player/person.png'];
    costumes[0].speed = 2;
    costumes[1].image = game.assets['assets/player/mouse.png'];
    costumes[1].speed = 3;
    costumes[2].image = game.assets['assets/player/gorilla.png'];
    costumes[2].speed = 1;
    costumes[3].image = game.assets['assets/player/alien.png'];
    costumes[3].speed = 2;
    costumes[4].image = game.assets['assets/player/ghost.png'];
    costumes[4].speed = 2;

    var state = new State(game, tmap, costumes);

    game.addEventListener(Event.ENTER_FRAME, function () {
      state.update();
    });
    game.addEventListener(Event.RIGHT_BUTTON_DOWN, function () {
      state.rightStart();
    });
    game.addEventListener(Event.RIGHT_BUTTON_UP, function () {
      state.rightEnd();
    });
    game.addEventListener(Event.LEFT_BUTTON_DOWN, function () {
      state.leftStart();
    });
    game.addEventListener(Event.LEFT_BUTTON_UP, function () {
      state.leftEnd();
    });
    game.addEventListener(Event.UP_BUTTON_DOWN, function () {
      state.upStart();
    });
    game.addEventListener(Event.UP_BUTTON_UP, function () {
      state.upEnd();
    });
    game.addEventListener(Event.DOWN_BUTTON_DOWN, function () {
      state.downStart();
    });
    game.addEventListener(Event.DOWN_BUTTON_UP, function () {
      state.downEnd();
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
