/* vim: set ai ts=8 sw=2 sts=2 et: */
var Tiled = (function () {
  function TMap(json, image) {
    var map = JSON.parse(json);
    this.width = map.width;
    this.height = map.height;
    this.callbacks = [];
    this.touchCallbacks = [];
    this.levels = [];
    this.level = 0;

    var level,
        levelCount = Math.floor(map.layers.length/4);

    for (level = 0; level < levelCount; level++) {
      this.levels.push(new TLevel(map.layers.slice(4*level, 4*level+4), map.width, map.height, image));
    }
  }

  TMap.prototype.currentLevel = function () {
    return this.levels[this.level];
  }

  TMap.prototype.setLevel = function (level) {
    this.level = level;
  }

  TMap.prototype.map = function () {
    return this.levels[this.level].map;
  };
  TMap.prototype.objects = function () {
    return this.levels[this.level].overlay;
  };

  TMap.prototype.checkCollision = function (sprite, gorilla) {
    return this.levels[this.level].checkCollision(sprite, gorilla);
  }

  TMap.prototype.place = function (sprite, x, y) {
    sprite.x = 32*x;
    sprite.y = 32*y;
  }

  TMap.prototype.on = function (eventName, eventNum, fn) {
    if (eventName === 'over') {
      if (this.callbacks[eventNum] === undefined) {
        this.callbacks[eventNum] = [fn];
      } else {
        this.callbacks[eventNum].push(fn);
      }
    } else if (eventName === 'touch') {
      if (this.touchCallbacks[eventNum] === undefined) {
        this.touchCallbacks[eventNum] = [fn];
      } else {
        this.touchCallbacks[eventNum].push(fn);
      }
    }
  }

  TMap.prototype.update = function (state) {
    var level = this.currentLevel(),
        x = Math.floor((state.player.x+state.player.width/2)/32),
        y = Math.floor((state.player.y+state.player.height)/32),
        evNum = level.eventIndex(x,y);
    if (evNum >= 0 && this.callbacks[evNum] !== undefined) {
      if (!state.nullEvent) {
        var ev = {
          x: x,
          y: y,
          tile: level.layers[0].data[x,y],
          remove: function () {
            level.removeEvent(x,y);
          }
        };
        for (var i=0; i<this.callbacks[evNum].length; i++) {
          state.playable = false;
          this.callbacks[evNum][i](ev);
          state.nullEvent = true;
        }
      }
    } else {
      state.nullEvent = false;
    }
    // Now handle touching object events
    var left = Math.floor((state.player.x+state.player.width/2-state.player.colbox.width/2)/32),
        xmid = Math.floor((state.player.x+state.player.width/2)/32),
        right = Math.floor((state.player.x+state.player.width/2+state.player.colbox.width/2)/32),
        top = Math.floor((state.player.y+state.player.height-state.player.colbox.height)/32);
        mid = Math.floor((state.player.y+state.player.height-state.player.colbox.height/2)/32);
        bottom = Math.floor((state.player.y+state.player.height)/32);

    var me = this;
    handleTouched(left, top);
    handleTouched(left, mid);
    handleTouched(left, bottom);
    handleTouched(xmid, top);
    handleTouched(xmid, mid);
    handleTouched(xmid, bottom);
    handleTouched(right, top);
    handleTouched(right, mid);
    handleTouched(right, bottom);
    function handleTouched(x, y) {
      var evNum = level.eventIndex(x, y);
      if (evNum >= 0 && me.touchCallbacks[evNum] !== undefined) {
        var ev = {
          x: x,
          y: y,
          tile: level.layers[0].data[x,y],
          remove: function () {
            level.removeEvent(x,y);
          }
        };
        for (var i=0; i<me.touchCallbacks[evNum].length; i++) {
          state.playable = false;
          me.touchCallbacks[evNum][i](ev);
          state.nullEvent = true;
        }
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
    var keepIndices;
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
          keepIndices = true;
        } else {
          keepIndices = false;
        }
        this.layers.push(new TLayer(layers[i].data, width, height, keepIndices));
        count = (count+1)%4;
      }
    }
    this.map.loadData(this.layers[0].data);
    this.overlay.loadData(this.layers[1].data);
    this.map.collisionData = this.layers[2].data;
  }

  TLevel.prototype.eventIndex = function (x, y) {
    return this.layers[3].data[y][x];
  }

  TLevel.prototype.removeEvent = function (x, y) {
    this.layers[3].data[y][x] = -1;
  }

  TLevel.prototype.hitTest = function (x, y, gorilla) {
    if (!gorilla) {
      var my = Math.floor(y/32),
          mx = Math.floor(x/32);
      return this.map.hitTest(x,y) || this.layers[3].data[my][mx] === 120;
    }
    return this.map.hitTest(x,y);
  };

  TLevel.prototype.intersect = function (line, gorilla) {
    var i, max, tile, x, y;

    if (line.start.x - line.end.x === 0) {
      // Vertical test
      max = line.end.y;
      x = line.start.x;
      for (i=line.start.y; i<max; i+=32) {
        if (this.hitTest(x, i, gorilla)) {
          return true;
        }
      }
      if (this.hitTest(x, max, gorilla)) {
        return true;
      }
    } else if (line.start.y - line.end.y === 0) {
      // Horizontal test
      max = line.end.x;
      y = line.start.y;
      for (i=line.start.x; i<max; i+=32) {
        if (this.hitTest(i, y, gorilla)) {
          return true;
        }
      }
      if (this.hitTest(max, y, gorilla)) {
        return true;
      }
    }
    // Otherwise 
    return false;
  }

  TLevel.prototype.checkCollision = function (sprite, gorilla) {
    var left = false,
        right = false, 
        top = false, 
        bottom = false,
        cx = sprite.x+sprite.width/2,
        b = sprite.y+sprite.height,
        bounds = {
          left: cx-sprite.colbox.width/2,
          right: cx+sprite.colbox.width/2,
          top: b-sprite.colbox.height,
          bottom: b
        };

    if (this.intersect({
          start: {x: bounds.left, y: bounds.top}, 
          end: {x: bounds.right, y: bounds.top}
        }, gorilla)) {
      top = true;
    }
    if (this.intersect({
          start: {x: bounds.left, y: bounds.bottom}, 
          end: {x: bounds.right, y: bounds.bottom}
        }, gorilla)) {
      bottom = true;
    }
    if (this.intersect({
          start: {x: bounds.right, y: bounds.top}, 
          end: {x: bounds.right, y: bounds.bottom}
        }, gorilla)) {
      right = true;
    }
    if (this.intersect({
          start: {x: bounds.left, y: bounds.top}, 
          end: {x: bounds.left, y: bounds.bottom}
        }, gorilla)) {
      left = true;
    }
    return {
      left: left,
      right: right,
      top: top,
      bottom: bottom
    };
  };

  TLevel.prototype.removeObject = function (x, y) {
    this.layers[1].data[y][x] = -1;
    this.overlay.loadData(this.layers[1].data);
  };

  return {
    Parse: function (json, image) {
      return new TMap(json, image);
    }
  };
}());
