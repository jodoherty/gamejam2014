var sbimage;
var lbimage;

var SmallBlock = enchant.Class.create(enchant.Sprite, {
  initialize: function(level, motion) {
    enchant.Sprite.call(this, 32, 32);
    this.level = level;
    this.motion = motion;
    this.image = sbimage;
    this.vleft = {
      x: -2,
      y: 0
    };
    this.vright = {
      x: 2,
      y: 0
    };
    this.vup = {
      x: 0,
      y: -2
    };
    this.vdown = {
      x: 0,
      y: 2
    };
    if (motion === "vertical") {
      this.v = this.vdown;
      this.direction = "down";
    } else {
      this.v = this.vright;
      this.direction = "right";
    }
  },
  changeDirection: function () {
    if (this.motion === "horizontal") {
      if (this.direction === "right") {
        this.direction = "left";
        this.v = this.vleft;
      } else {
        this.direction = "right";
        this.v = this.vright;
      }
    } else if (this.motion === "vertical") {
      if (this.direction === "down") {
        this.direction = "up";
        this.v = this.vup;
      } else {
        this.direction = "down";
        this.v = this.vdown;
      }
    } else if (this.motion === "clockwise") {
      if (this.direction === "left") {
        this.direction = "up";
        this.v = this.vup;
      } else if (this.direction === "up") {
        this.direction = "right";
        this.v = this.vright;
      } else if (this.direction === "down") {
        this.direction = "left";
        this.v = this.vleft;
      } else {
        this.direction = "down";
        this.v = this.vdown;
      }
    } else {
      if (this.direction === "right") {
        this.direction = "up";
        this.v = this.vup;
      } else if (this.direction === "down") {
        this.direction = "right";
        this.v = this.vright;
      } else if (this.direction === "up") {
        this.direction = "left";
        this.v = this.vleft;
      } else {
        this.direction = "down";
        this.v = this.vdown;
      }
    }
  },
  collided: function () {
    this.changeDirection();
  },
  step: function () {
    this.x += this.v.x;
    this.y += this.v.y;
  },
  stepBack: function () {
    this.x -= this.v.x;
    this.y -= this.v.y;
  },
  update: function() {
    this.step();
    var hit = this.level.checkCollision(this);
    if ((hit.left && this.direction === "left") || 
        (hit.right && this.direction === "right") ||
        (hit.up && this.direction === "up") ||
        (hit.down && this.direction === "down")) {
      this.stepBack();
      this.changeDirection();
    }
  }
});

var LargeBlock = enchant.Class.create(SmallBlock, {
  initialize: function(level, motion) {
    SmallBlock.call(this, level, motion);
    this.width = 62;
    this.height = 62;
    this.image = lbimage;
  },
});

var EntityParser = function (json, tmap) {
  var data = JSON.parse(json);
  data.blocks.forEach(function (block) {
    if (block.type === "small") {
      tmap.getLevel(block.level).addSmallBlock(block.x, block.y, block.motion);
    } else if (block.type === "large") {
      tmap.getLevel(block.level).addLargeBlock(block.x, block.y, block.motion);
    }
  });
};
