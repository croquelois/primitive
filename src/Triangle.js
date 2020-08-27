/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
/* globals Random, Utils, Scanline */

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  Random = require("./Random.js");
  Utils = require("./Utils.js");
  Scanline = require("./Scanline.js");
}
/* jshint ignore:end */

class Triangle {
  constructor(size){
    this.size = size;
    this.xs = [];
    this.ys = [];
  }
  static newRandom(size){
    let triangle = new Triangle(size);
    const {height, width} = size;
    let x1 = Random.integer(width);
    let y1 = Random.integer(height);
    let x2 = Random.range(x1-15,x1+15);
    let y2 = Random.range(y1-15,y1+15);
    let x3 = Random.range(x1-15,x1+15);
    let y3 = Random.range(y1-15,y1+15);
    triangle.xs = [x1,x2,x3];
    triangle.ys = [y1,y2,y3];
    triangle.mutate();
    return triangle;
  }
  copy(){
    let triangle = new Triangle(this.size);
    triangle.xs = this.xs.slice();
    triangle.ys = this.ys.slice();
    return triangle;
  }
  mutate(){
    const {height, width} = this.size;
    const m = 16;
    do {
      let i = Random.integer(this.xs.length);
      this.xs[i] = Utils.clampInt(this.xs[i]+Math.floor(Random.normal()*m), -m, width-1+m);
      this.ys[i] = Utils.clampInt(this.ys[i]+Math.floor(Random.normal()*m), -m, height-1+m);
    }while(!this.valid());
  }
  valid(){
    function computeAngle(x1,y1,x2,y2){
      let d12 = Math.sqrt((x1*x1 + y1*y1) * (x2*x2 + y2*y2));
      return Math.acos(x1*x2/d12 + y1*y2/d12);
    }
    const minDegrees = Math.PI/12;
    const {xs,ys} = this;
    let a1 = computeAngle(xs[1]-xs[0],ys[1]-ys[0],xs[2]-xs[0],ys[2]-ys[0]);
    let a2 = computeAngle(xs[0]-xs[1],ys[0]-ys[1],xs[2]-xs[1],ys[2]-ys[1]);
    let a3 = Math.PI - a1 - a2;
    return a1 > minDegrees && a2 > minDegrees && a3 > minDegrees;
  }
  rasterize(){
    const {height, width} = this.size;
    const {xs,ys} = this;
    let buf = this.rasterizeTriangle(xs[0], ys[0], xs[1], ys[1], xs[2], ys[2], []);
    return Scanline.cropScanlines(buf, width, height);
  }
  rasterizeTriangle(x1, y1, x2, y2, x3, y3, buf){
    if(y1 > y3){
      [x1, x3] = [x3, x1];
      [y1, y3] = [y3, y1];
    }
    if(y1 > y2){
      [x1, x2] = [x2, x1];
      [y1, y2] = [y2, y1];
    }
    if(y2 > y3){
      [x2, x3] = [x3, x2];
      [y2, y3] = [y3, y2];
    }
    if(y2 == y3){
      return this.rasterizeTriangleBottom(x1, y1, x2, y2, x3, y3, buf);
    } else if(y1 == y2){
      return this.rasterizeTriangleTop(x1, y1, x2, y2, x3, y3, buf);
    } else {
      let x4 = x1 + (y2-y1)/(y3-y1)*(x3-x1);
      let y4 = y2;
      buf = this.rasterizeTriangleBottom(x1, y1, x2, y2, x4, y4, buf);
      buf = this.rasterizeTriangleTop(x2, y2, x4, y4, x3, y3, buf);
      return buf;
    }
  }
  rasterizeTriangleBottom(x1, y1, x2, y2, x3, y3, buf){
    let s1 = (x2-x1) / (y2-y1);
    let s2 = (x3-x1) / (y3-y1);
    let ax = x1;
    let bx = x1;
    for(let y = y1; y <= y2; y++){
      let a = Math.floor(ax);
      let b = Math.floor(bx);
      ax += s1;
      bx += s2;
      if(a > b)
        [a, b] = [b, a];
      buf.push(new Scanline(y, a, b));
    }
    return buf;
  }
  rasterizeTriangleTop(x1, y1, x2, y2, x3, y3, buf){
    let s1 = (x3-x1) / (y3-y1);
    let s2 = (x3-x2) / (y3-y2);
    let ax = x3;
    let bx = x3;
    for(let y = y3; y > y1; y--){
      ax -= s1;
      bx -= s2;
      let a = Math.floor(ax);
      let b = Math.floor(bx);
      if(a > b)
        [a, b] = [b, a];
      buf.push(new Scanline(y, a, b));
    }
    return buf;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Triangle;