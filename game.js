// PLATFORMER STARTER

var TILE = 40;
var GRAVITY = 0.7;
var JUMP_POWER = -12;
var MOVE_SPEED = 4;
var FRICTION = 0.82;

var keys = {};

keyPressed = function() {
    keys[keyCode] = true;
};

keyReleased = function() {
    keys[keyCode] = false;
};

// 0 = air
// 1 = ground
// 2 = spike
// 3 = goal
var level = [
    "000000000000000000000000",
    "000000000000000000000000",
    "000000000000000000000030",
    "000000000000000000001111",
    "000000000000000000000000",
    "000001110000000111000000",
    "000000000000000000000000",
    "000000000111000000000000",
    "000000000000000000000000",
    "011100000000000011100000",
    "000000000000000000000000",
    "111111111112111111111111"
];

var player = {
    x: 80,
    y: 100,
    w: 28,
    h: 34,
    vx: 0,
    vy: 0,
    onGround: false
};

var cameraX = 0;
var cameraY = 0;

var textures = {
    player: getImage("avatars/aqualine-sapling"),
    ground: getImage("cute/GrassBlock"),
    spike: getImage("cute/Rock"),
    goal: getImage("cute/Star")
};

var getTile = function(col, row) {
    if (row < 0 || row >= level.length ||
        col < 0 || col >= level[0].length) {
        return "1"; // outside map = wall
    }
    return level[row][col];
};

var isSolid = function(tile) {
    return tile === "1";
};

var rectsOverlap = function(a, b) {
    return a.x < b.x + b.w &&
           a.x + a.w > b.x &&
           a.y < b.y + b.h &&
           a.y + a.h > b.y;
};

var hitSpecialTile = function(tileType) {
    var left = floor(player.x / TILE);
    var right = floor((player.x + player.w - 1) / TILE);
    var top = floor(player.y / TILE);
    var bottom = floor((player.y + player.h - 1) / TILE);

    for (var row = top; row <= bottom; row++) {
        for (var col = left; col <= right; col++) {
            if (getTile(col, row) === tileType) {
                return true;
            }
        }
    }
    return false;
};

var resetPlayer = function() {
    player.x = 80;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
};

var moveAndCollide = function() {
    player.x += player.vx;

    var left = floor(player.x / TILE);
    var right = floor((player.x + player.w - 1) / TILE);
    var top = floor(player.y / TILE);
    var bottom = floor((player.y + player.h - 1) / TILE);

    for (var row = top; row <= bottom; row++) {
        for (var col = left; col <= right; col++) {
            if (isSolid(getTile(col, row))) {
                if (player.vx > 0) {
                    player.x = col * TILE - player.w;
                }
                if (player.vx < 0) {
                    player.x = (col + 1) * TILE;
                }
                player.vx = 0;
            }
        }
    }

    player.y += player.vy;
    player.onGround = false;

    left = floor(player.x / TILE);
    right = floor((player.x + player.w - 1) / TILE);
    top = floor(player.y / TILE);
    bottom = floor((player.y + player.h - 1) / TILE);

    for (row = top; row <= bottom; row++) {
        for (col = left; col <= right; col++) {
            if (isSolid(getTile(col, row))) {
                if (player.vy > 0) {
                    player.y = row * TILE - player.h;
                    player.onGround = true;
                }
                if (player.vy < 0) {
                    player.y = (row + 1) * TILE;
                }
                player.vy = 0;
            }
        }
    }
};

var updatePlayer = function() {
    if (keys[LEFT] || keys[65]) {
        player.vx = -MOVE_SPEED;
    }

    if (keys[RIGHT] || keys[68]) {
        player.vx = MOVE_SPEED;
    }

    if (!(keys[LEFT] || keys[65] || keys[RIGHT] || keys[68])) {
        player.vx *= FRICTION;
    }

    if ((keys[UP] || keys[87] || keys[32]) && player.onGround) {
        player.vy = JUMP_POWER;
        player.onGround = false;
    }

    player.vy += GRAVITY;

    if (player.vy > 16) {
        player.vy = 16;
    }

    moveAndCollide();

    if (hitSpecialTile("2")) {
        resetPlayer();
    }

    if (hitSpecialTile("3")) {
        fill(255, 255, 255);
        textSize(30);
        textAlign(CENTER, CENTER);
        text("YOU WIN!", 200, 200);
        noLoop();
    }

    if (player.y > level.length * TILE + 200) {
        resetPlayer();
    }
};

var updateCamera = function() {
    cameraX = player.x - 200;
    cameraY = player.y - 200;

    if (cameraX < 0) {
        cameraX = 0;
    }

    if (cameraY < 0) {
        cameraY = 0;
    }
};

var drawLevel = function() {
    imageMode(CORNER);

    var startCol = max(0, floor(cameraX / TILE) - 1);
    var endCol = min(level[0].length - 1, floor((cameraX + width) / TILE) + 1);

    var startRow = max(0, floor(cameraY / TILE) - 1);
    var endRow = min(level.length - 1, floor((cameraY + height) / TILE) + 1);

    for (var row = startRow; row <= endRow; row++) {
        for (var col = startCol; col <= endCol; col++) {
            var tile = getTile(col, row);
            var x = col * TILE - cameraX;
            var y = row * TILE - cameraY;

            if (tile === "1") {
                image(textures.ground, x, y - 20, TILE, TILE + 25);
            }

            if (tile === "2") {
                image(textures.spike, x + 5, y + 5, 30, 30);
            }

            if (tile === "3") {
                image(textures.goal, x + 5, y + 5, 30, 30);
            }
        }
    }
};

var drawPlayer = function() {
    imageMode(CORNER);
    image(
        textures.player,
        player.x - cameraX,
        player.y - cameraY,
        player.w,
        player.h
    );
};

draw = function() {
    background(143, 216, 255);

    updatePlayer();
    updateCamera();

    drawLevel();
    drawPlayer();

    fill(0, 0, 0);
    textSize(13);
    textAlign(LEFT, BASELINE);
    text("Arrow keys / WASD to move", 10, 20);
    text("Space / W / Up to jump", 10, 38);
};
