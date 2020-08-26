var points = 0;

var fps = 60;
var BatGenerationSpeed = 100;
var BatSpeed = 100;
var BatDirectionSpeed = 5;
var BatAnimationSpeed = 1;

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var gameMinX;
var gameMaxX;
var gameWidth;
var gameMinY;
var gameMaxY;
var gameHeight;

function Bat(x, y, width, height, direction) {
  this.x = x;
  this.y = y;
  this.height = height;
  this.width = width;
  this.direction = direction;
  this.animationstate = 0;
  this.type = "Bat";
  Bat.objects.push(this);
}
Bat.objects = [];
Bat.width = 64;
Bat.height = 64;
Bat.points = 100;
Bat.image = new Image();
Bat.image.src = "bat.png";

Bat.prototype.remove = function () {
  Bat.objects.splice(
    Bat.objects.findIndex((i) => i == this),
    1
  );
};

function Window(x, y) {
  this.x = x;
  this.y = y;
  this.type = "Window";
  Window.objects.push(this);
}
Window.objects = [];
Window.count = 1000;
Window.width = 96;
Window.horizontalSpacing = 50;
Window.height;
Window.points = -500;
Window.image = new Image();
Window.image.src = "window.png";

const updateBrowserWindow = () => {
  var browserWindowHasChanged = false;
  if (
    canvas.width != window.innerWidth ||
    canvas.height != window.innerHeight
  ) {
    browserWindowHasChanged = true;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gameMinX = 0;
  gameMaxX = canvas.width;
  gameWidth = gameMaxX - gameMinX;
  gameMinY = 100;
  gameMaxY = canvas.height;
  gameHeight = gameMaxY - gameMinY;

  Window.height = Math.max(64, gameHeight - 200);
  if (browserWindowHasChanged) {
    Window.objects = [];
    Window.count = 1000;
  }
};
updateBrowserWindow();

const generateBats = () => {
  if (
    Math.random() <
    ((1 / Math.pow(2, Bat.objects.length)) * BatGenerationSpeed) / 100
  ) {
    var bat = new Bat(
      Math.random() * (gameWidth - Bat.width) + gameMinX,
      Math.random() * (gameHeight - Bat.height) + gameMinY,
      Bat.width,
      Bat.height,
      Math.random() * 2 * Math.PI
    );
  }
};

const moveBats = () => {
  Bat.objects.forEach((thisbat) => {
    //move the bat
    thisbat.x = thisbat.x + (Math.cos(thisbat.direction) * BatSpeed) / fps;
    thisbat.y = thisbat.y + (Math.sin(thisbat.direction) * BatSpeed) / fps;

    //delete bats off the board
    if (
      thisbat.x > gameMaxX ||
      thisbat.x < -Bat.width + gameMinX ||
      thisbat.y > gameMaxY ||
      thisbat.y < -Bat.height + gameMinY
    ) {
      thisbat.remove();
    }

    //change direction
    thisbat.direction =
      thisbat.direction +
      (Math.cos(Math.random() * Math.PI) / fps) * BatDirectionSpeed;
  });
};

const updateWindows = () => {
  if (Window.objects.length < Window.count) {
    for (var i = 0; i < Window.count; i++) {
      var tries = 0;
      var x = Math.random() * (gameWidth - Window.width) + gameMinX;
      while (
        //checking for colisions/too close to existing windows
        Window.objects.some(
          (thiswindow) =>
            x > thiswindow.x - Window.width - Window.horizontalSpacing &&
            x < thiswindow.x + Window.width + Window.horizontalSpacing
        ) &&
        tries < 1000
      ) {
        var x = Math.random() * (gameWidth - Window.width) + gameMinX;
        tries++;
      }
      
      if (tries >= 1000) {
        Window.count = Window.objects.length;
      } else {
        var window = new Window(
          x,
          gameMaxY - (100 + Window.height),
        );
      }
    }
  }
  Window.objects.forEach(
    (thiswindow) => (thiswindow.y = gameMaxY - (100 + Window.height))
  );
};

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  shoot(x, y);
});

const shoot = (x, y) => {
  shotobject =
    Bat.objects.find(
      (thisbat) =>
        x > thisbat.x &&
        x <= thisbat.x + thisbat.width &&
        y > thisbat.y &&
        y < thisbat.y + thisbat.height
    ) ||
    Window.objects.find(
      (thiswindow) =>
        x > thiswindow.x &&
        x <= thiswindow.x + thiswindow.width &&
        y > thiswindow.y &&
        y < thiswindow.y + thiswindow.height
    );
  if (shotobject) {
    switch (shotobject.type) {
      case "Bat":
        shotobject.remove();
        points += Bat.points;
        break;
      case "Window":
        points += Window.points;
        break;
      case undefined:
        break;
    }
  }
};

const update = () => {
  updateBrowserWindow();
  updateWindows();
  moveBats();
  generateBats();
  redraw();
};

var redraw = () => {
  //clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  //draw windows
  context.fillStyle = Window.color;
  Window.objects.forEach((thiswindow) =>
    context.drawImage(
      Window.image,
      thiswindow.x,
      thiswindow.y,
      Window.width,
      Window.height
    )
  );
  //draw bats
  context.fillStyle = Bat.color;
  Bat.objects.forEach((thisbat) => {
    //context.fillRect(thisbat.x, thisbat.y, thisbat.width, thisbat.height)
    var currentanimationx;
    switch (
      Math.floor(((thisbat.animationstate % fps) / fps) * 4 * BatAnimationSpeed)
    ) {
      case 0:
        currentanimationx = 32;
        break;
      case 1:
        currentanimationx = 64;
        break;
      case 2:
        currentanimationx = 96;
        break;
      case 3:
        currentanimationx = 64;
        break;
    }
    context.drawImage(
      Bat.image,
      currentanimationx,
      0,
      32,
      32,
      thisbat.x,
      thisbat.y,
      thisbat.width,
      thisbat.height
    );
    thisbat.animationstate++;
  });

  //draw header
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, 100);

  context.font = "40pt sans-serif";
  context.fillStyle = "white";
  context.textBaseline = "top";

  context.textAlign = "left";
  context.fillText("Fledermäuse schiessen", 0, 0);

  context.textAlign = "right";
  context.fillText("Punkte: " + points, canvas.width, 0);
};

setInterval(update, 1000 / fps);
