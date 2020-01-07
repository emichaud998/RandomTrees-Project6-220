let r = require('rrt');
let canvas = lib220.newCanvas(400,400);
r.drawMap(canvas, r.getDemoMap());
let start = new r.Point(1, 1);
let goal = new r.Point(10, 390);
let map = r.getDemoMap();
let options = {
 mapSize: 400,
 maxExtension: 150,
 goalBias: 0.5,
 maxSamples: 1000,
 callback: visualize
};

//distance(p1: Point, p2: Point): number
function distance(p1, p2){
  let xDistance = Math.pow(p2.x - p1.x, 2);
  let yDistance = Math.pow(p2.y - p1.y, 2);
  return Math.sqrt(xDistance + yDistance);
}

//samplePoint(mapSize: number, goal: Point, goalBias: number): Point
function samplePoint(mapSize, goal, goalBias){
  if (Math.random() < goalBias){
    return new r.Point(goal.x, goal.y);
  }
  else{
    return new r.Point((Math.random() * mapSize), (Math.random() * mapSize));
  }
}
//collides(map: Line[], p1: Point, p2: Point): boolean
function collides(map, p1, p2){
  let l = new r.Line(p1, p2);
  for (let i = 0; i < map.length; ++i){
    if (r.intersects(map[i], l)){
      return true;
    }
  }
  return false;
}

//getPath(goal: Tree): Point[]
function getPath(goal){
  let temp = goal;
  let points = [];
  points.push(goal.node);
  while (temp.parent !== null){
    temp = temp.parent;
    points.push(temp.node);
  }
  return points;
}  

class Tree {
  // constructor(node: Point, children: Tree[], parent: Tree | null)
  constructor(node, children, parent) {
    this.node = node;
    this.children = children;
    this.parent = parent;
  }

  // nearest(p : Point): Tree
  nearest(p) {
    let d = distance(this.node, p);
    let best = this;
    for (let i = 0; i < this.children.length; ++i) {
      let other = this.children[i].nearest(p);
      if (distance(other.node, p) < d) {
        best = other;
        d = distance(other.node, p);
      }
    }
    return best;
  }

  // extend(p: Point, maxExtension: number): Point
  extend(p, maxExtension) {
    let q = this.node;
    let z = 0;
    if (distance(q, p) < maxExtension) {
      z = p;
    } 
    else {
      let d = distance(p, q);
      let f = maxExtension / d;
      z = new r.Point(q.x + f * (p.x - q.x), q.y + f * (p.y - q.y));
    }
    return z;
}

  // add(p: Point): Tree
  add(p) {
    let qNew = new Tree(p, [], this);
    this.children.push(qNew);
    return qNew;
  }
}

//plan(start: Point, goal: Point, map: Line[], options: Options): Point[] | undefined
function plan(start, goal, map, options){
  let i = 0;
  let t = new Tree(start, [], null);
  while (i < options.maxSamples){
    let p = samplePoint(options.mapSize, goal, options.goalBias);
    let q = t.nearest(p);
    let z = q.extend(p, options.maxExtension); 
    if (!collides(map.lines, q.node, z)){
      t = t.add(z);
      options.callback(p, q, z, t);
      if (z.x === goal.x && z.y === goal.y){
        return getPath(t);
      }
    }

    ++i;
  }
  return undefined;
}

function simplifyPath(path, map) {
  if (path === undefined){
    return undefined;
  }
  function reducer(newPath, p) {
    if (newPath.length < 2) {
      newPath.push(p);
      return newPath;
    }
    const last = newPath[newPath.length - 2];
    if (!collides(map.lines, p, last)) {
      newPath[newPath.length - 1] = p;
    } else {
      newPath.push(p);
    }
    return newPath;
  }
  let simPath = path.reduce(reducer, []);
  viewer2(simPath);
  return simPath;
}

function viewer(canvas, path){
  for(let i = path.length-1; i-1 >=1; --i){
    canvas.drawFilledCircle(path[i].x, path[i].y, 3, [0, 0, 1]);
    canvas.drawLine(path[i].x, path[i].y, path[i-1].x, path[i-1].y, [1, 0, 0]);
    lib220.sleep(10);
  }
}

function viewer2(path){
  let canvas2 = lib220.newCanvas(400,400);
  r.drawMap(canvas2, r.getDemoMap());
  canvas2.drawFilledCircle(start.x, start.y, 3, [1, 0, 0]);
  canvas2.drawFilledCircle(goal.x, goal.y, 3, [0, 0.75, 0]);
  for(let i = path.length-1; i-1 >=0; --i){
    canvas2.drawFilledCircle(path[i].x, path[i].y, 3, [0, 0, 1]);
    canvas2.drawLine(path[i].x, path[i].y, path[i-1].x, path[i-1].y, [1, 0, 0]);
    lib220.sleep(20);
  }
}

let path = plan(start, goal, map, options);
let path2 = simplifyPath(path, map);


function visualize(p, q, z, t) {
  canvas.clear();
  r.drawMap(canvas, r.getDemoMap());
  canvas.drawFilledCircle(start.x, start.y, 3, [1, 0, 0]);
  canvas.drawFilledCircle(goal.x, goal.y, 3, [0, 0.75, 0]);
  drawTree(canvas, t);
  canvas.drawFilledCircle(p.x, p.y, 3, [0.5, 0.5, 0]);
  canvas.drawFilledCircle(q.node.x, q.node.y, 3, [0, 0, 1]);
  canvas.drawFilledCircle(z.x, z.y, 3, [0.25, 0.5, 0]);
  canvas.drawLine(q.node.x, q.node.y, z.x, z.y, [1, 0, 0]);
  canvas.drawLine(p.x, p.y, z.x, z.y, [1, 0.5, 0.8]);
  lib220.sleep(250);
}

function drawTree(canvas, t){
  let path = getPath(t);
  viewer(canvas, path);
} 

/*
function visualize2(p, q, z, t) {
  canvas3.drawFilledCircle(start.x, start.y, 3, [1, 0, 0]);
  canvas3.drawFilledCircle(z.x, z.y, 3, [0, 0, 1]);
  canvas3.drawFilledCircle(goal.x, goal.y, 3, [0, 0.75, 0]);
  canvas3.drawLine(q.node.x, q.node.y, z.x, z.y, [1, 0, 0]);
  lib220.sleep(100);
}
*/
