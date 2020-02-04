const viewport = new Viewport(640, 480);

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
  t: "x^2 + y^2 < 0.75",
  f: (x, y) => x * x + y * y,
  r: OPS["<"],
  b: 0.75,
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
  // let xw0 = viewport.viewToWorldX(0),
  //     dx = viewport.viewToWorldXFactor();
  // for (let yv = 0, yw = viewport.viewToWorldY(yv),
  //     dy = viewport.viewToWorldYFactor(), idx = 0;
  //     yv < viewport.viewHeight; yv++, yw += dy) {
  //   for (let xv = 0, xw = xw0;
  //       xv < viewport.viewWidth; xv++, xw += dx, idx++) {

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
  let canvas = createCanvas(viewport.viewWidth, viewport.viewHeight);
  canvas.mousePressed(click);

  loadConstraints();

  _.noLoop();
}

function draw() {
  background(255);
  _.loadPixels();
  for (let yv = 0, idx = 0; yv < viewport.viewHeight; yv++) {
    for (let xv = 0; xv < viewport.viewWidth; xv++, idx++) {
      let idx_pix = idx << 2;
      if (CONSTRAINTS_MASK[idx]) {
        _.pixels[idx_pix + 0] = COLOR_IN_R;
        _.pixels[idx_pix + 1] = COLOR_IN_G;
        _.pixels[idx_pix + 2] = COLOR_IN_B;
      } else {
        _.pixels[idx_pix + 0] = COLOR_OUT_R;
        _.pixels[idx_pix + 1] = COLOR_OUT_G;
        _.pixels[idx_pix + 2] = COLOR_OUT_B;
      }
    }
  }
  _.updatePixels();
}

function click() {
  let v = projectionVtoV(_.mouseX, _.mouseY);
  _.stroke(0);
  _.line(_.mouseX, _.mouseY, v[0], v[1]);
  _.stroke(255);
  _.circle(_.mouseX, _.mouseY, 4);
  _.circle(v[0], v[1], 4);
}
