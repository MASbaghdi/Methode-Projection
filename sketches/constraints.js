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
  a: false,
});
constraints.push({
  t: "y > 0",
  f: (x, y) => y,
  r: OPS[">"],
  b: 0,
  c: color("hsla(90, 100%, 50%, 0.2)"),
  a: false,
});
constraints.push({
  t: "x^2 + y^2 < 0.75",
  f: (x, y) => x * x + y * y,
  r: OPS["<"],
  b: 0.75,
  c: color("hsla(180, 100%, 50%, 0.2)"),
  a: false,
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

let xv;
let yv;
let xw;
let yw;

let showAll = false;

const COLOR_IN_R = 255;
const COLOR_IN_G = 0;
const COLOR_IN_B = 0;

const COLOR_OUT_R = 200;
const COLOR_OUT_G = 200;
const COLOR_OUT_B = 200;

const PIX_PER_LOOP = 1000;
const THRESHOLD = Math.min(
  viewport.viewToWorldXFactor(),
  viewport.viewToWorldYFactor()
);

function blend(pixels, idx, ra, ga = ra, ba = ra, aa = 255) {
  // a over b
  let rb = pixels[idx + 0];
  let gb = pixels[idx + 1];
  let bb = pixels[idx + 2];

  let ro = (rb + aa * ra / 255) & 255;
  let go = (gb + aa * ga / 255) & 255;
  let bo = (bb + aa * ba / 255) & 255;

  pixels[idx + 0] = ro;
  pixels[idx + 1] = go;
  pixels[idx + 2] = bo;
}

function redrawAll() {
  xv = yv = 0;
  background(255);
  _.loop();
}

function showConstraints() {
  let parent = _.createDiv();
  for (let constraint of constraints) {
    let checkbox = _.createCheckbox("`"+constraint.t+"`", constraint.a);
    checkbox.changed((e) => {
      constraint.a = e.target.checked;
      redrawAll();
    });
    checkbox.style("font-size:0.7em; display:inline-block");
    parent.child(checkbox);
  }
}

function setup() {
  createCanvas(viewport.viewWidth, viewport.viewHeight);
  showConstraints();
  redrawAll();
}

function forEachPixelBlend(idx) {
  let idx_pix = idx << 2;

  for (let constraint of constraints) {
    if (!constraint.a) continue;
    const f = constraint.f;
    const r = constraint.r;
    const b = constraint.b;
    const c = constraint.c;
    if (r(f(xw, yw), b, THRESHOLD)) {
      blend(_.pixels, idx_pix, red(c), green(c), blue(c), alpha(c));
    }
  }

  if (OPS["="](xw, 0, THRESHOLD)) {
    _.pixels[idx_pix + 0] = 0;
    _.pixels[idx_pix + 1] = 0;
    _.pixels[idx_pix + 2] = 0;
  }
  if (OPS["="](yw, 0, THRESHOLD)) {
    _.pixels[idx_pix + 0] = 0;
    _.pixels[idx_pix + 1] = 0;
    _.pixels[idx_pix + 2] = 0;
  }
}

function forEachPixel(idx) {
  let idx_pix = idx << 2;

  let is_in = true;
  for (let constraint of constraints) {
    if (!constraint.a) continue;
    const f = constraint.f;
    const r = constraint.r;
    const b = constraint.b;
    const c = constraint.c;
    if (!r(f(xw, yw), b, THRESHOLD)) {
      is_in = false;
      break;
    }
  }

  if (is_in) {
    _.pixels[idx_pix + 0] = COLOR_IN_R;
    _.pixels[idx_pix + 1] = COLOR_IN_G;
    _.pixels[idx_pix + 2] = COLOR_IN_B;
  } else {
    _.pixels[idx_pix + 0] = COLOR_OUT_R;
    _.pixels[idx_pix + 1] = COLOR_OUT_G;
    _.pixels[idx_pix + 2] = COLOR_OUT_B;
  }

  if (OPS["="](xw, 0, THRESHOLD)) {
    _.pixels[idx_pix + 0] = 0;
    _.pixels[idx_pix + 1] = 0;
    _.pixels[idx_pix + 2] = 0;
  }
  if (OPS["="](yw, 0, THRESHOLD)) {
    _.pixels[idx_pix + 0] = 0;
    _.pixels[idx_pix + 1] = 0;
    _.pixels[idx_pix + 2] = 0;
  }
}


function draw() {
  _.loadPixels();
  for (let i = 0; i < PIX_PER_LOOP; i++) {
    if (yv < _.height) {
      if (xv < _.width) {
        let idx = yv * _.width + xv;

        xw = viewport.viewToWorldX(xv);
        yw = viewport.viewToWorldY(yv);

        if (showAll) {
          forEachPixelBlend(idx);
        } else {
          forEachPixel(idx);
        }

        xv++;
      } else {
        yv++;
        xv = 0;
      }
    } else {
      noLoop();
      break;
    }
  }
  _.updatePixels();
}
