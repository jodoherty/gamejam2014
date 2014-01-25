/* vim: set ai ts=8 sw=2 sts=2 et: */
var Tiled = (function () {
  function TMap(json, image) {
    var map = JSON.parse(json);
    this.width = map.width;
    this.height = map.height;
    this.callbacks = {};
    this.levels = [];
    this.level = 0;

    var level,
        levelCount = Math.floor(map.layers.length/4);

    for (level = 0; level < levelCount; level++) {
      this.levels.push(new TLevel(map.layers.slice(4*level, 4*level+4), map.width, map.height, image));
    }
  }

  TMap.prototype.setLevel = function (level) {
    this.level = level;
  }

  TMap.prototype.map = function () {
    return this.levels[this.level].map;
  }

  TMap.prototype.checkCollision = function (sprite) {
    return this.levels[this.level].checkCollision(sprite);
  }

  TMap.prototype.place = function (sprite, x, y) {
    sprite.x = 32*x;
    sprite.y = 32*y;
  }

  TMap.prototype.on = function (tileType, fn) {
    if (this.callbacks[tileType] === undefined) {
      this.callbacks[tileType] = [fn];
    } else {
      this.callbacks[tileType].push(fn);
    }
  }

  TMap.prototype.update = function (state) {
    var i, max,
        tile = this.map().checkTile(state.player.x-state.player.width/2.0, state.player.y-state.player.height/2.0);
    if (this.callbacks[tile] !== undefined) {
      max = this.callbacks[tile].length;
      for (i=0; i<max; i++) {
        this.callbacks[tile][i]();
      }
    }
  }

  function TLayer(data, width, height, collision) {
    this.data = [];
    this.width = width;
    this.height = height;
    for (var i=0; i<height; i++) {
      this.data.push(data.slice(i*width, (i+1)*width));
      if (!collision) {
        for (var j=0; j<width; j++) {
          this.data[i][j]--;
        }
      }
    }
  }

  function TLevel(layers, width, height, tileset) {
    var collision;
    var count = 0;
    this.map = new Map(32, 32);
    this.map.image = tileset;
    this.overlay = new Map(32, 32);
    this.overlay.image = tileset;
    this.layers = [];
    for (var i=0; i<layers.length; i++) {
      if (layers[i].type === "tilelayer") {
        // Every third layer is a collision layer
        if (count === 2) {
          collision = true;
        } else {
          collision = false;
        }
        this.layers.push(new TLayer(layers[i].data, width, height, collision));
        count = (count+1)%3;
      }
    }
    this.map.loadData(this.layers[0].data);
    this.overlay.loadData(this.layers[1].data);
    this.map.collisionData = this.layers[2].data;
  }

  TLevel.prototype.intersect = function (line) {
    var i, max, tile, x, y;

    if (line.start.x - line.end.x === 0) {
      // Vertical test
      max = line.end.y;
      x = line.start.x;
      for (i=line.start.y; i<max; i+=32) {
        if (this.map.hitTest(x, i)) {
          return true;
        }
      }
      if (this.map.hitTest(x, max)) {
        return true;
      }
    } else if (line.start.y - line.end.y === 0) {
      // Horizontal test
      max = line.end.x;
      y = line.start.y;
      for (i=line.start.x; i<max; i+=32) {
        if (this.map.hitTest(i, y)) {
          return true;
        }
      }
      if (this.map.hitTest(max, y)) {
        return true;
      }
    }
    // Otherwise 
    return false;
  }

  TLevel.prototype.checkCollision = function (sprite) {
    var left = false,
        right = false, 
        top = false, 
        bottom = false,
        bounds = {
          left: sprite.x,
          right: sprite.x+sprite.width,
          top: sprite.y,
          bottom: sprite.y+sprite.height
        };

    if (this.intersect({
          start: {x: bounds.left, y: bounds.top}, 
          end: {x: bounds.right, y: bounds.top}
        })) {
      top = true;
    }
    if (this.intersect({
          start: {x: bounds.left, y: bounds.bottom}, 
          end: {x: bounds.right, y: bounds.bottom}
        })) {
      bottom = true;
    }
    if (this.intersect({
          start: {x: bounds.right, y: bounds.top}, 
          end: {x: bounds.right, y: bounds.bottom}
        })) {
      right = true;
    }
    if (this.intersect({
          start: {x: bounds.left, y: bounds.top}, 
          end: {x: bounds.left, y: bounds.bottom}
        })) {
      left = true;
    }
    return {
      left: left,
      right: right,
      top: top,
      bottom: bottom
    };
  };

  return {
    Parse: function (json, image) {
      return new TMap(json, image);
    }
  };
}());
