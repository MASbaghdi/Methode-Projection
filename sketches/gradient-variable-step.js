const viewport = new Viewport(640, 480, -2, 1.5, -2, 1.5);

const N = 2;
function poly(x) {
  return 2.2 + x * (3.2 + x * (2.5 + x * (-1.7 + x * (-1.1))));
}
function poly_(x) {
  return 3.2 + x * (5 + x * (-5.1 + x * (-4.4)));
}
function F_(point) {
  let y = 0;
  for (let i = 0; i < N; i++) {
    y += poly(point[i]);
  }
  return y;
}
function gradF_(point) {
  let y = [];
  for (let i = 0; i < N; i++) {
    y.push(poly_(point[i]));
  }
  return y;
}
function stepF_(x, step) {
  let x_ = [];
  let grad = gradF_(x);
  for (let i = 0; i < N; i++) {
    x_[i] = x[i] + step * grad[i];
  }
  return F_(x_);
}
function findStep(x, min, max, delta) {
  let stepMax = min;
  let stepFMax = stepF_(x, stepMax);
  for (let step = min; step <= max; step += delta) {
    let stepF = stepF_(x, step);
    if (stepF > stepFMax) {
      stepFMax = stepF;
      stepMax = step;
    }
  }
  return stepMax;
}

// const k = 0.001;
// function F_(point) {
//   let x = point[0];
//   let y = point[1];
//   let phi = -k * Math.hypot(x, y);
//   return Math.sin(phi);
// }
// function gradF_(point) {
//   let x = point[0];
//   let y = point[1];
//   let phi = -k * Math.hypot(x, y);
//   let tmp = -k * 2 * Math.cos(phi) / phi;
//   return [x * tmp, y * tmp];
// }


let F = [];
let min = +Infinity;
let max = -Infinity;
function loadF() {
  for (let y = 0; y < viewport.viewHeight; y++) {
    F[y] = [];
    let y_ = viewport.viewToWorldY(y);
    for (let x = 0; x < viewport.viewWidth; x++) {
      let x_ = viewport.viewToWorldX(x);
      let v = F_([x_, y_]);
      F[y][x] = v;
      if (v > max) max = v;
      if (v < min) min = v;
    }
  }
}

function gradientStep(point) {
  let newPoint = [];
  let step_amount = findStep(point, -10, 10, 0.01);
  let grad = gradF_(point);
  for (let i = 0; i < N; i++) {
    newPoint[i] = point[i] + step_amount * grad[i];
    console.log(i + ": " + newPoint[i] + " = " + point[i] + " + " + step_amount + " * "+ grad[i]);
  }
  return newPoint;
}
function gradient(solution1) {
  let solutions = [];
  let solution2;
  solutions.push(solution1);
  let i = 1;
  while (true) {
    solution2 = gradientStep(solution1);
    solutions.push(solution2);
    if (equals(solution1, solution2) || i == 0) {
      return solutions;
    }
    solution1 = solution2;
    i++;
  }
  return solutions;
}

let solution;

function setup() {
  loadF();

  let canvas = _.createCanvas(viewport.viewWidth, viewport.viewHeight);
  canvas.mousePressed(click);

  let clearButton = _.createButton("clear");
  clearButton.mousePressed(clear);

  let stepButton = _.createButton("step");
  stepButton.mousePressed(step);

  let controls = _.createDiv();
  controls.child(clearButton);
  controls.child(stepButton);

  _.noLoop();
}

function draw() {
  _.background(255);
  _.colorMode(_.HSB);
  _.loadPixels();
  for (let y = 0; y < _.height; y++) {
    for (let x = 0; x < _.width; x++) {
      let idx = (y * _.width + x) << 2;
      let c = _.color(_.map(F[y][x], min, max, 120, 360), 100, 100);
      _.pixels[idx + 0] = _.red(c);
      _.pixels[idx + 1] = _.green(c);
      _.pixels[idx + 2] = _.blue(c);
    }
  }
  _.updatePixels();
  _.colorMode(_.RGB);
  _.stroke(255);
}

function click() {
  solution = [viewport.viewToWorldX(_.mouseX),
    viewport.viewToWorldY(_.mouseY)];
  _.circle(viewport.worldToViewX(solution[0]),
    viewport.worldToViewY(solution[1]), 4);
  console.log(solution + " : " + F[_.mouseY][_.mouseX]);
}

function step() {
  if (solution) {
    let solution1 = solution;
    let solution2 = gradientStep(solution1);
    _.line(viewport.worldToViewX(solution1[0]), viewport.worldToViewY(solution1[1]),
      viewport.worldToViewX(solution2[0]), viewport.worldToViewY(solution2[1]));
    _.circle(viewport.worldToViewX(solution2[0]), viewport.worldToViewY(solution2[1]), 4);
    solution = solution2;
    console.log(solution1);
    // console.log(solution2);
  }
}

function clear() {
  solution = null;
  _.redraw();
}

function drawAll(solutions) {
  let solution1 = solutions[0];
  let solution2;
  _.ellipse(solution1[0] + w2, solution1[1] + h2, 3, 3);
  // _.strokeWeight(3);
  for (let i = 1; i < solutions.length; i++) {
    solution2 = solutions[i];
    // console.log(solution1);
    // console.log(solution2);
    _.line(viewport.worldToViewX(solution1[0]), viewport.worldToViewY(solution1[1]),
      viewport.worldToViewX(solution2[0]), viewport.worldToViewY(solution2[1]));
    _.circle(viewport.worldToViewX(solution2[0]), viewport.worldToViewY(solution2[1]), 4);
    solution1 = solution2;
  }
}
