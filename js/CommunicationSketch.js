function swap(a, i, j) {
  let temp = a[i];
  a[i] = a[j];
  a[j] = temp;
}

function factorial(n) {
  if (n == 1) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}

let naiveTSPSketch = new p5((sketch) => {
  let cities = [];
  const totalCities = 5;

  let order = [];

  let totalPermutations;
  let count;

  let recordDistance;
  let bestEver;
  let play;

  sketch.setup = () => {
    sketch.createCanvas(640, 480);
    sketch.frameRate(5);
    play = false;
  };

  sketch.restart = () => {
    count = 1;

    for (let i = 0; i < totalCities; i++) {
      cities[i] = sketch.createVector(
        sketch.random(20, sketch.width - 20),
        sketch.random((sketch.height - 50) / 2)
      );
      order[i] = i;
    }

    recordDistance = sketch.calcDistance(cities, order);
    bestEver = order.slice();

    totalPermutations = factorial(totalCities);
    // console.log(totalPermutations);

    play = true;
  };

  sketch.pause = () => {
    play = !play;

    if (count == totalPermutations) play = false;
  };

  sketch.draw = () => {
    if (!play) return;
    sketch.background(212,228,247);

    sketch.stroke(34, 59, 240);
    sketch.strokeJoin(sketch.BEVEL);
    sketch.strokeWeight(4);
    sketch.noFill();
    sketch.beginShape();
    for (let i = 0; i < order.length; i++) {
      let n = bestEver[i];
      sketch.vertex(cities[n].x, cities[n].y);
    }
    sketch.endShape();

    sketch.noStroke();
    sketch.fill(25, 9, 52);
    for (let i = 0; i < cities.length; i++) {
      sketch.ellipse(cities[i].x, cities[i].y, 10, 10);
    }

    sketch.translate(0, (sketch.height - 50) / 2);

    sketch.stroke(25, 9, 152);
    sketch.strokeJoin(sketch.BEVEL);
    sketch.strokeWeight(1);
    sketch.noFill();
    sketch.beginShape();
    for (let i = 0; i < order.length; i++) {
      let n = order[i];
      sketch.vertex(cities[n].x, cities[n].y);
    }
    sketch.endShape();

    sketch.noStroke();
    sketch.fill(25, 9, 52);
    for (let i = 0; i < cities.length; i++) {
      sketch.ellipse(cities[i].x, cities[i].y, 10, 10);
    }

    let d = sketch.calcDistance(cities, order);
    if (d < recordDistance) {
      recordDistance = d;
      bestEver = order.slice();
    }

    sketch.textSize(32);

    sketch.fill(25, 9, 52);
    let percent = 100 * (count / totalPermutations);
    sketch.text(
      sketch.nf(percent, 0, 2) + "% completé",
      20, (sketch.height - 50) / 2 + 30
    );

    sketch.nextOrder();
  };

  sketch.nextOrder = () => {
    count++;

    // STEP 1 of the algorithm
    // https://www.quora.com/How-would-you-explain-an-algorithm-that-generates-permutations-using-lexicographic-ordering
    let largestI = -1;
    for (let i = 0; i < order.length - 1; i++) {
      if (order[i] < order[i + 1]) {
        largestI = i;
      }
    }
    if (largestI == -1) {
      play = false;
      // console.log('finished');
    }

    // STEP 2
    let largestJ = -1;
    for (let j = 0; j < order.length; j++) {
      if (order[largestI] < order[j]) {
        largestJ = j;
      }
    }

    // STEP 3
    swap(order, largestI, largestJ);

    // STEP 4: reverse from largestI + 1 to the end
    let endArray = order.splice(largestI + 1);
    endArray.reverse();
    order = order.concat(endArray);
  };

  sketch.calcDistance = (points, order) => {
    let sum = 0;
    for (let i = 0; i < order.length - 1; i++) {
      let cityAIndex = order[i];
      let cityA = points[cityAIndex];
      let cityBIndex = order[i + 1];
      let cityB = points[cityBIndex];
      sum += sketch.dist(cityA.x, cityA.y, cityB.x, cityB.y);
    }
    return sum;
  };

}, 'naiveTSP');

$("#naiveTSP-restart").click(() => {
  naiveTSPSketch.restart();
});
$("#naiveTSP-pause").click(() => {
  naiveTSPSketch.pause();
});
