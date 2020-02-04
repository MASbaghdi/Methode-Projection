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

let solution_set;

const OPS = {
   "=": (a, b, threshold = 0) => Math.abs(b - a) <= threshold,
  "!=": (a, b, threshold = 0) => Math.abs(b - a)  > threshold,
   ">": (a, b) => a  > b,
  ">=": (a, b) => a >= b,
   "<": (a, b) => a  < b,
  "<=": (a, b) => a <= b,
};

const constraints = [];
constraints.push({
  t: "x > 0",
  f: (x, y) => x,
  r: OPS[">"],
  b: 0,
  c: color(255, 0, 0, 20),
  a: true,
});
constraints.push({
  t: "y > 0",
  f: (x, y) => y,
  r: OPS[">"],
  b: 0,
  c: color("hsla(90, 100%, 50%, 0.2)"),
  a: true,
});
constraints.push({
  t: "x^2 + y^2 < 1",
  f: (x, y) => x * x + y * y,
  r: OPS["<"],
  b: 1,
  c: color("hsla(180, 100%, 50%, 0.2)"),
  a: true,
});
constraints.push({
  t: "x^2 + y^2 > 0.25",
  f: (x, y) => x * x + y * y,
  r: OPS[">"],
  b: 0.25,
  c: color("hsla(180, 100%, 50%, 0.2)"),
  a: false,
});
constraints.push({
  t: "x <= y",
  f: (x, y) => x - y,
  r: OPS["<="],
  b: 0,
  c: color("hsla(270, 100%, 50%, 0.2)"),
  a: false,
});

const COLOR_IN_R = 255;
const COLOR_IN_G = 0;
const COLOR_IN_B = 0;

const COLOR_OUT_R = 200;
const COLOR_OUT_G = 200;
const COLOR_OUT_B = 200;

const THRESHOLD = Math.min(
  viewport.viewToWorldXFactor(),
  viewport.viewToWorldYFactor()
);

let MASK_MIN_X = viewport.viewWidth, MASK_MAX_X = -1,
    MASK_MIN_Y = viewport.viewHeight, MASK_MAX_Y = -1;
const CONSTRAINTS_MASK = new Array(viewport.viewWidth * viewport.viewHeight);

function loadConstraints() {
  for (let yv = 0; yv < viewport.viewHeight; yv++) {
    for (let xv = 0; xv < viewport.viewWidth; xv++) {
      let xw = viewport.viewToWorldX(xv);
      let yw = viewport.viewToWorldY(yv);
      let idx = viewport.coordsToIndex(xv, yv);

      let is_in = true;
      for (let constraint of constraints) {
        if (!constraint.a) continue;
        const f = constraint.f;
        const r = constraint.r;
        const b = constraint.b;
        if (!r(f(xw, yw), b, THRESHOLD)) {
          is_in = false;
          break;
        }
      }

      CONSTRAINTS_MASK[idx] = is_in;
      if (is_in) {
        if (xv < MASK_MIN_X) MASK_MIN_X = xv;
        if (xv > MASK_MAX_X) MASK_MAX_X = xv;
        if (yv < MASK_MIN_Y) MASK_MIN_Y = yv;
        if (yv > MASK_MAX_Y) MASK_MAX_Y = yv;
      }
    }
  }
}

function projectionVtoV(xv, yv) {
  if (CONSTRAINTS_MASK[viewport.coordsToIndex(xv, yv)]) {
    return [xv, yv];
  }

  let xmin = MASK_MIN_X;
  let ymin = MASK_MIN_Y;
  let min = (xv - xmin) * (xv - xmin) + (yv - ymin) * (yv - ymin);
  for (let y = MASK_MIN_Y; y <= MASK_MAX_Y; y++) {
    for (let x = MASK_MIN_X; x <= MASK_MAX_X; x++) {
      if (CONSTRAINTS_MASK[viewport.coordsToIndex(x, y)]) {
        let dist = (xv - x) * (xv - x) + (yv - y) * (yv - y);
        if (dist < min) {
          min = dist;
          xmin = x;
          ymin = y;
        }
      }
    }
  }
  return [xmin, ymin];
}

function setup() {
  loadConstraints();
  loadF();

  let canvas = createCanvas(viewport.viewWidth, viewport.viewHeight);
  //canvas.mousePressed(click);

  let startButton = _.createButton("start");
  startButton.mousePressed(start);

  let clearButton = _.createButton("clear");
  clearButton.mousePressed(clear);

  let stepButton = _.createButton("step");
  stepButton.mousePressed(step);

  let controls = _.createDiv();
  controls.child(clearButton);
  controls.child(startButton);
  controls.child(stepButton);

  _.noLoop();
}

function draw() {
  background(255);
  _.colorMode(_.HSB);
  _.loadPixels();
  for (let yv = 0, idx = 0; yv < viewport.viewHeight; yv++) {
    for (let xv = 0; xv < viewport.viewWidth; xv++, idx++) {
      let idx_pix = idx << 2;
      if (CONSTRAINTS_MASK[idx]) {
        let c = _.color(_.map(F[yv][xv], min, max, 120, 360), 100, 100);
        _.pixels[idx_pix + 0] = _.red(c);
        _.pixels[idx_pix + 1] = _.green(c);
        _.pixels[idx_pix + 2] = _.blue(c);
      } else {
        let c = _.color(_.map(F[yv][xv], min, max, 120, 360), 100, 40);
        _.pixels[idx_pix + 0] = _.red(c);
        _.pixels[idx_pix + 1] = _.green(c);
        _.pixels[idx_pix + 2] = _.blue(c);
      }
    }
  }
  _.updatePixels();
  _.colorMode(_.RGB);
}

const SAMPLE = 10;

function start() {
  clear();
  solution_set = [];
  for (let i = 0; i < 10; i++) {
    let x = _.int(_.random(viewport.viewWidth));
    let y = _.int(_.random(viewport.viewHeight));
    solution_set[i] = [viewport.viewToWorldX(x), viewport.viewToWorldY(y)];
    _.stroke(255);
    _.circle(x, y, 4);
  }
  // console.log(solution + " : " + F[_.mouseY][_.mouseX]);
}

function step() {
  if (solution_set) {
    for (let solution in solution_set) {
      let solution1 = solution_set[solution];
      let solution2 = gradientStep(solution1);
      _.stroke(255);
      let s2vx = viewport.worldToViewX(solution2[0]);
      let s2vy = viewport.worldToViewY(solution2[1]);
      _.line(viewport.worldToViewX(solution1[0]), viewport.worldToViewY(solution1[1]),
        s2vx, s2vy);
      _.circle(s2vx, s2vy, 4);

      let s2pv = projectionVtoV(s2vx, s2vy);
      _.circle(s2pv[0], s2pv[1], 4);

      _.stroke(0);
      _.line(s2vx, s2vy, s2pv[0], s2pv[1]);

      solution_set[solution] = [viewport.viewToWorldX(s2pv[0]), viewport.viewToWorldY(s2pv[1])];
    }

    let best = 0;
    let max = F_(solution_set[0]);
    for (let i = 1; i < solution_set.length; i++) {
      let val = F_(solution_set[i]);
      if (val > max) {
        max = val;
        best = i;
      }
    }

    let bestSolution = solution_set[best];
    _.stroke(200, 100, 20);
    _.circle(viewport.worldToViewX(bestSolution[0]),
      viewport.worldToViewY(bestSolution[1]), 6);
  }
}

function clear() {
  solution_set = null;
  _.redraw();
}
