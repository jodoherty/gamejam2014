/* vim: set ai ts=8 sw=2 sts=2 et: */
var Tiled = (function () {
  function TMap(json) {
    var map = JSON.parse(json);
    this.width = map.width;
    this.height = map.height;
    this.layers = [];
    for (var i=0; i<map.layers.length; i++) {
      this.layers.push(TLayer(map.layers[i].data));
    }
  }

  TMap.prototype.checkCollision(bounds) {
  };

  function TLayer(data, width, height) {
    this.data = [];
    this.width = width;
    this.height = height;
    for (var i=0; i<height; i++) {
      this.data.push(data.slice(i*width, (i+1)*width));
    }
  }

  T.Parse = function (json) {
    return new Tmap(json);
  };

  return T;
}());
