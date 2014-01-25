/* vim: set ai ts=8 sw=2 sts=2 et: */
var Tiled = (function () {

  function TMap(json, image) {
    var map = JSON.parse(json);
    this.map = new Map(32, 32);
    this.map.image = image;
    this.overlay = new Map(32, 32);
    this.overlay.image = image;
    this.width = map.width;
    this.height = map.height;
    this.layers = [];
    for (var i=0; i<map.layers.length; i++) {
      if (map.layers[i].type === "tilelayer") {
        this.layers.push(new TLayer(map.layers[i].data, map.width, map.height));
      }
    }
    this.map.loadData(this.layers[0].data);
    this.overlay.loadData(this.layers[1].data);
    this.map.collisionData = this.layers[2].data;
  }

  TMap.prototype.intersect = function (line) {
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

  TMap.prototype.checkCollision = function (sprite) {
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

  function TLayer(data, width, height) {
    this.data = [];
    this.width = width;
    this.height = height;
    for (var i=0; i<height; i++) {
      this.data.push(data.slice(i*width, (i+1)*width));
    }
  }

  return {
    Parse: function (json, image) {
      return new TMap(json, image);
    }
  };
}());
