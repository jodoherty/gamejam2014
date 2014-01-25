/* vim: set ai ts=8 sw=2 sts=2 et: */
enchant();

var WALL_RANGE = [25,36],
    FAKE_WALL_RANGE = [37,40],
    ANY_WALL_RANGE = [25, 40],
    HOLE_RANGE = [1,4],
    DOOR_RANGE = [41,44],
    UPSTAIRS_RANGE = [45,46],
    DOWNSTAIRS_RANGE = [47.48];

function normalized(v) {
  if (v.x === 0 || v.y === 0) {
    return {
      x: v.x,
      y: v.y
    };
  }
  m = Math.sqrt((v.x*v.x)+(v.y*v.y))
  return {
    x: v.x/m,
    y: v.y/m
  };
}

function bounds(sprite) {
  return {
    cx: sprite.x+sprite.width/2.0,
    cy: sprite.y+sprite.height/2.0,
    l: sprite.x,
    t: sprite.y,
    b: sprite.y+sprite.height,
    r: sprite.x+sprite.width
  };
}

function intersect(map, line, range) {
  var i, max, tile, x, y;

  if (line.start.x - line.end.x === 0) {
    // Vertical test
    max = line.end.y;
    x = line.start.x;
    for (i=line.start.y; i<max; i+=32) {
      tile = map.checkTile(x, i);
      if (tile >= range[0] && tile <= range[1]) {
        return true;
      }
    }
    tile = map.checkTile(x, max);
    if (tile >= range[0] && tile <= range[1]) {
      return true;
    }
  } else if (line.start.y - line.end.y === 0) {
    // Horizontal test
    max = line.end.x;
    y = line.start.y;
    for (i=line.start.x; i<max; i+=32) {
      tile = map.checkTile(i, y);
      if (tile >= range[0] && tile <= range[1]) {
        return true;
      }
    }
    tile = map.checkTile(max, y);
    if (tile >= range[0] && tile <= range[1]) {
      return true;
    }
  }
  // Otherwise 
  return false;
}

function makeMap(json, image) {
  var tilemap = JSON.parse(json);
  var width = tilemap.width;
  var height = tilemap.height;
  var count = tilemap.layers[0].data.length;
  var data = [];
  for (var i=0; i<height; i++) {
    data.push(tilemap.layers[0].data.slice(i*width, (i+1)*width));
  }
  var map = new Map(32, 32);
  map.image = image;
  map.loadData(data);
  return map;
}

window.onload = function () {
  var game = new Game(1280, 720);

  game.preload('assets/mansion-tileset.png', 
    'assets/sewer-tileset.png', 
    'assets/player/person.png',
    'assets/player/mouse.png',
    'assets/player/gorilla.png',
    'assets/player/alien.png',
    'assets/player/ghost.png',
    'assets/first-floor.json'
  );

  game.onload = function () {
    var scene = new Scene();

    var maps = {
      mansion1: makeMap(game.assets['assets/first-floor.json'], game.assets['assets/mansion-tileset.png'])
    };

    var map = maps.mansion1;

    scene.addChild(map);

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

    var select = 0;
    var player = new Sprite(48, 48);
    player.image = costumes[0].image;
    player.speed = costumes[0].speed;
    player.x = game.width/2.0-player.width/2.0;
    player.y = game.height/2.0-player.height/2.0;
    scene.addChild(player);

    scene.x = 9.5*32;
    scene.y = 6*32;
    player.x -= 9.5*32;
    player.y -= 6*32;

    var d = {
      x: 0,
      y: 0
    };

    game.addEventListener(Event.ENTER_FRAME, function () {
      var r = bounds(player),
          n = normalized(d),
          dx = n.x*player.speed,
          dy = n.y*player.speed;

      if (intersect(map, {start: {x: r.l, y: r.t+dy}, end: {x: r.r, y: r.t+dy}}, WALL_RANGE)) {
        dy = 0;
      }
      if (intersect(map, {start: {x: r.l, y: r.b+dy}, end: {x: r.r, y: r.b+dy}}, WALL_RANGE)) {
        dy = 0;
      }
      if (intersect(map, {start: {x: r.r+dx, y: r.t}, end: {x: r.r+dx, y: r.b}}, WALL_RANGE)) {
        dx = 0;
      }
      if (intersect(map, {start: {x: r.l+dx, y: r.t}, end: {x: r.l+dx, y: r.b}}, WALL_RANGE)) {
        dx = 0;
      }
      scene.x -= dx;
      scene.y -= dy;
      player.x += dx;
      player.y += dy;
    });

    game.addEventListener(Event.RIGHT_BUTTON_DOWN, function () {
      d.x = 1;
    });
    game.addEventListener(Event.RIGHT_BUTTON_UP, function () {
      if (d.x > 0) {
        d.x = 0;
      }
    });
    game.addEventListener(Event.LEFT_BUTTON_DOWN, function () {
      d.x = -1;
    });
    game.addEventListener(Event.LEFT_BUTTON_UP, function () {
      if (d.x < 0) {
        d.x = 0;
      }
    });
    game.addEventListener(Event.UP_BUTTON_DOWN, function () {
      d.y = -1;
    });
    game.addEventListener(Event.UP_BUTTON_UP, function () {
      if (d.y < 0) {
        d.y = 0;
      }
    });
    game.addEventListener(Event.DOWN_BUTTON_DOWN, function () {
      d.y = 1;
    });
    game.addEventListener(Event.DOWN_BUTTON_UP, function () {
      if (d.y > 0) {
        d.y = 0;
      }
    });

    game.addEventListener(Event.A_BUTTON_UP, function (e) {
      var cx = player.x+player.width/2.0,
          cy = player.y+player.height/2.0;

      select = (select+1)%costumes.length;
      player.image = costumes[select].image;
      player.width = costumes[select].width;
      player.height = costumes[select].height;
      player.speed = costumes[select].speed;
      player.x = cx-player.width/2.0;
      player.y = cy-player.height/2.0;
    });

    game.pushScene(scene);
  };
  game.fps = 60;
  game.keybind(65, 'left');
  game.keybind(68, 'right');
  game.keybind(87, 'up');
  game.keybind(83, 'down');
  game.keybind(16, 'a');
  game.start();


};
