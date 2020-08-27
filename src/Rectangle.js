/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
/* globals Random, Utils, Scanline */

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  Random = require("./Random.js");
  Utils = require("./Utils.js");
  Scanline = require("./Scanline.js");
}
/* jshint ignore:end */

class Rectangle {
  constructor(size){
    this.size = size;
    this.xs = [];
    this.ys = [];
  }
  static newRandom(size){
    let rectangle = new Rectangle(size);
    const {height, width} = size;
    let x1 = Random.integer(width);
    let y1 = Random.integer(height);
    let x2 = Utils.clampInt(Random.range(x1-16,x1+16), 0, width-1);
    let y2 = Utils.clampInt(Random.range(y1-16,y1+16), 0, height-1);
    rectangle.xs = [x1,x2];
    rectangle.ys = [y1,y2];
    rectangle.mutate();
    return rectangle;
  }
  copy(){
    let rectangle = new Rectangle(this.size);
    rectangle.xs = this.xs.slice();
    rectangle.ys = this.ys.slice();
    return rectangle;
  }
  mutate(){
    const {height, width} = this.size;
    const m = 16;
    let i = Random.integer(this.xs.length);
    this.xs[i] = Utils.clampInt(this.xs[i]+Math.floor(Random.normal()*m), 0, width-1);
    this.ys[i] = Utils.clampInt(this.ys[i]+Math.floor(Random.normal()*m), 0, height-1);
  }
  rasterize(){
    const {xs,ys} = this;
    let [y1,y2] = ys;
    let [x1,x2] = xs;
    if(y1 > y2)
      [y1, y2] = [y2, y1];
    if(x1 > x2)
      [x1, x2] = [x2, x1];
    let lines = [];
    for(let y=y1; y<=y2; y++)
      lines.push(new Scanline(y, x1, x2));
    return lines;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Rectangle;