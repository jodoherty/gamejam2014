/* vim: set ai ts=8 sw=2 sts=2 et: */
var State = (function () {

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

  function State(game, tmap, costumes) {
    this.costumes = costumes;
    this.game = game;
    this.tmap = tmap;
    this.direction = 0;
    this.player = new Sprite(48, 48);
    this.player.image = costumes[0].image;
    this.player.speed = costumes[0].speed;
    this.costume = 0;
    this.v = {
      x: 0,
      y: 0
    }
    this.scene = new Scene();
    this.scene.addChild(this.tmap.map());
    this.scene.addChild(this.player);
    this.tmap.place(this.player, 19, 0);
    game.pushScene(this.scene);
  }

  State.prototype.update = function () {
    var n = normalized(this.v),
        dx = n.x*this.player.speed,
        dy = n.y*this.player.speed;

    this.player.x += dx;
    this.player.y += dy;

    var colliRect = this.tmap.checkCollision(this.player);
    if (colliRect.left || colliRect.right) {
      this.player.x -= dx;
    }
    if (colliRect.top || colliRect.bottom) {
      this.player.y -= dy;
    }
    this.tmap.update(this);
    // Keep the player centered on the camera
    this.player.scene.x = -this.player.x + this.player.scene.width/2 - this.player.width/2;
    this.player.scene.y = -this.player.y + this.player.scene.height/2 - this.player.height/2;
  };

  State.prototype.rightStart = function() {
    this.v.x = 1;
  };
  State.prototype.rightEnd = function() {
    if (this.v.x > 0) {
      this.v.x = 0;
    }
  };
  State.prototype.leftStart = function() {
    this.v.x = -1;
  };
  State.prototype.leftEnd = function() {
    if (this.v.x < 0) {
      this.v.x = 0;
    }
  };
  State.prototype.upStart = function() {
    this.v.y = -1;
  };
  State.prototype.upEnd = function() {
    if (this.v.y < 0) {
      this.v.y = 0;
    }
  };
  State.prototype.downStart = function() {
    this.v.y = 1;
  };
  State.prototype.downEnd = function() {
    if (this.v.y > 0) {
      this.v.y = 0;
    }
  };

  State.prototype.changeCostumes = function() {
    var cx = this.player.x+this.player.width/2.0,
        cy = this.player.y+this.player.height/2.0;

    this.costume = (this.costume+1)%this.costumes.length;
    this.player.image = this.costumes[this.costume].image;
    this.player.width = this.costumes[this.costume].width;
    this.player.height = this.costumes[this.costume].height;
    this.player.speed = this.costumes[this.costume].speed;
    this.player.x = cx-this.player.width/2.0;
    this.player.y = cy-this.player.height/2.0;
  }

  return State;
}());
