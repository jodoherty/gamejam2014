/* vim: set ai ts=8 sw=2 sts=2 et: */
var State = (function () {
  var DOWN  = 0,
      RIGHT = 1,
      UP    = 2
      LEFT  = 3;

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
    this.teleporters = false;
    this.player = new Sprite();
    this.player.frame = 1;
    this.action = "standing";
    this.direction = "down";
    this.walking = {
      left: [6,7],
      right: [8,9],
      up: [10,11],
      down: [4,5]
    };
    this.standing = {
      left: 2,
      right: 3,
      down: 1,
      back: 0
    };
    this.costume = 0;
    this.costumeLimit = 1;
    this.changeCostumes();
    this.v = {
      x: 0,
      y: 0
    }
    this.scene = new Scene();
    this.scene.addChild(this.tmap.map());
    this.scene.addChild(this.player);
    this.tmap.place(this.player, 19, 0);
    this.follow();
    game.pushScene(this.scene);
    this.playable = false;
    this.nullEvent = false;
    this.step = 0;

    var state = this;
    this.tmap.on('over', 127, function () {
      // Fall down to the basement 
      state.stop();
      game.assets['assets/sounds/falling.wav'].play();
      state.toLevel(1, 500, function () {
        state.playable = true;
      });
    });
    this.tmap.on('over', 126, function () {
      // Take stairs to first floor
      state.stop();
      game.assets['assets/sounds/stairs.wav'].play();
      state.toLevel(0, 500, function () {
        state.playable = true;
      });
    });
    this.tmap.on('over', 125, function () {
      // Take stairs to the basement 
      state.stop();
      game.assets['assets/sounds/stairs.wav'].play();
      state.toLevel(1, 500, function () {
        state.playable = true;
      });
    });
    this.tmap.on('over', 124, function () {
      // Take stairs to the second floor
      state.stop();
      game.assets['assets/sounds/stairs.wav'].play();
      state.toLevel(4, 500, function () {
        state.playable = true;
      });
    });
    this.tmap.on('over', 123, function () {
      // Fall to the first floor
      state.stop();
      game.assets['assets/sounds/falling.wav'].play();
      state.toLevel(0, 500, function () {
        state.playable = true;
      });
    });
    this.tmap.on('over', 122, function () {
      // Take stairs to the sewer
      state.stop();
      game.assets['assets/sounds/stairs.wav'].play();
      state.toLevel(2, 500, function () {
        state.playable = true;
      });
    });
    this.tmap.on('touch', 121, function (ev) {
      // Gain a new costume
      state.stop();
      state.tmap.currentLevel().removeObject(ev.x, ev.y);
      ev.remove();
      state.unlockCostume();
      state.changeCostumes();
      state.playable = true;
    });
    this.tmap.on('touch', 120, function (ev) {
      // Break wall
      state.stop();
      if (state.costume === 2) {
        ev.remove();
        game.assets['assets/sounds/break.wav'].play();
        setTimeout(function () {
          state.tmap.currentLevel().removeObject(ev.x, ev.y);
          state.playable = true;
        }, 200);
      } else {
        state.playable = true;
      }
    });
    this.tmap.on('over', 119, function () {
      state.stop();
      game.assets['assets/sounds/stairs.wav'].play();
      state.toLevel(3, 500, function () {
        state.playable = true;
      });
    });
    this.tmap.on('over', 118, function () {
      if (state.teleporters) {
        state.player.x = 32*5;
        state.player.y = 32*8;
      }
      state.playable = true;
    });
    this.tmap.on('over', 117, function () {
      if (state.teleporters) {
        state.player.x = 32*8;
        state.player.y = 32*8;
      }
      state.playable = true;
    });
    this.tmap.on('over', 116, function () {
      if (state.teleporters) {
        state.player.x = 32*9;
        state.player.y = 32*5;
      }
      state.playable = true;
    });
    this.tmap.on('over', 115, function () {
      if (state.teleporters) {
        state.player.x = 32*9;
        state.player.y = 32*8;
      }
      state.playable = true;
    });
    this.tmap.on('over', 114, function () {
      state.finish();
    });
    this.tmap.on('touch', 113, function () {
      // Activate teleporters
      state.teleporters = true;
      state.tmap.currentLevel().removeObject(39, 4);
      state.playable = true;
    });

    var state = this;
    setTimeout(function () {
      state.downStart();
    }, 1000);
  }

  State.prototype.toLevel = function (level, timeout, next) {
    var state = this;
    state.scene.removeChild(state.player);
    state.scene.removeChild(state.tmap.map());
    state.scene.removeChild(state.tmap.objects());
    state.tmap.currentLevel().entities.forEach(function (obj) {
      state.scene.removeChild(obj);
    });
    state.tmap.setLevel(level);
    setTimeout(function () {
      state.scene.addChild(state.tmap.map());
      state.scene.addChild(state.tmap.objects());
      state.tmap.currentLevel().entities.forEach(function (obj) {
        state.scene.addChild(obj);
      });
      state.scene.addChild(state.player);
      next();
    }, timeout);
  };

  State.prototype.update = function () {
    var n = normalized(this.v),
        dx = n.x*this.player.speed,
        dy = n.y*this.player.speed;

    this.player.x += dx;
    this.player.y += dy;

    var colliRect = this.tmap.checkCollision(this.player, this.costume === 2);
    if (colliRect.left || colliRect.right) {
      this.player.x -= dx;
    }
    if (colliRect.top || colliRect.bottom) {
      this.player.y -= dy;
    }
    this.player.colbox.x = this.player.x;
    this.player.colbox.y = this.player.y;
    // Keep the player centered on the camera
    this.follow();

    if (this.auto !== undefined) {
      this.auto();
    }

    this.tmap.update(this);
    

    if (this.v.x !== 0 || this.v.y !== 0) {
      this.action = "walking";
    } else {
      this.action = "standing";
    }
    if (this.v.x < 0) {
      this.direction = "left";
    } else if (this.v.x > 0) {
      this.direction = "right";
    } else if (this.v.y < 0) {
      this.direction = "up";
    } else if (this.v.y > 0) {
      this.direction = "down";
    }

    if (this.step % 15 === 0 && this.action === "walking") {
      this.player.frame++;
    }

    if (this.player.frame < this.walking[this.direction][0] || this.player.frame > this.walking[this.direction][1]) {
      this.player.frame = this.walking[this.direction][0];
    }

    this.step++;
  };

  State.prototype.follow = function() {
    this.scene.x = -this.player.x + this.scene.width/2 - this.player.width/2;
    this.scene.y = -this.player.y + this.scene.height/2 - this.player.height/2;
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
  State.prototype.stop = function() {
    this.v.x = 0;
    this.v.y = 0;
  };

  State.prototype.unlockCostume = function() {
    this.costumeLimit++;
    if (this.costumeLimit > this.costumes.length) {
      this.costumeLimit = this.costumes.length;
    }
  };

  State.prototype.changeCostumes = function() {
    var cx = this.player.x+this.player.width/2.0,
        y = this.player.y+this.player.height;

    this.costume = (this.costume+1)%this.costumeLimit;
    this.costumes[this.costume].x = cx-this.costumes[this.costume].width/2.0;
    this.costumes[this.costume].y = y-this.costumes[this.costume].height;
    var colliRect = this.tmap.checkCollision(this.costumes[this.costume], this.costume === 2);
    if (colliRect.left || colliRect.right || colliRect.top || colliRect.bottom) {
      this.costume--;
      if (this.costume < 0) {
        if (this.costumeLimit > 0) {
          this.costume = this.costumeLimit-1;
        } else {
          this.costume = 0;
        }
      }
      return;
    }
    this.game.assets['assets/sounds/rustle.wav'].play();
    this.player.image = this.costumes[this.costume].image;
    this.player.width = this.costumes[this.costume].width;
    this.player.height = this.costumes[this.costume].height;
    this.player.speed = this.costumes[this.costume].speed;
    this.player.x = cx-this.player.width/2.0;
    this.player.y = y-this.player.height;
    this.player.colbox = this.costumes[this.costume].colbox;
    this.player.frame = 1;
  };
  
  State.prototype.end = function () {
    // Game Over
    if (this.onend) {
      this.onend();
    }
  };

  State.prototype.finish = function () {
    if (this.onwin) {
      this.onwin();
    }
  };

  return State;
}());
