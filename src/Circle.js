/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
/* globals Random, Utils, Scanline */
"use strict";

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  Random = require("./Random.js");
  Utils = require("./Utils.js");
  Scanline = require("./Scanline.js");
}
/* jshint ignore:end */

class Circle {
  constructor(size){
    this.size = size;
    this.c = [0,0];
    this.r = 1;
  }
  static newRandom(size){
    let circle = new Circle(size);
    const {width, height} = size;
    circle.c = [Random.integer(width), Random.integer(height)];
    circle.r = Random.range(1,32);
    return circle;
  }
  copy(){
    let circle = new Circle(this.size);
    circle.c = this.c.slice();
    circle.r = this.r;
    return circle;
  }
  mutate(){
    const {width, height} = this.size;
    const m = 16;
    if(Random.bool()){
      this.c[0] = Utils.clampInt(this.c[0]+Math.floor(Random.normal()*m), 0, width-1);
      this.c[1] = Utils.clampInt(this.c[1]+Math.floor(Random.normal()*m), 0, height-1);
    }else{
      this.r = Utils.clampInt(this.r+Math.floor(Random.normal()*m), 1, Math.min(width,height)-1);
    }
  }
  rasterize(){
    const {width, height} = this.size;
    let r = this.r;
    let rr = r*r;
    let [xc,yc] = this.c;
    let y1 = Math.max(0,yc-r);
    let y2 = Math.min(height-1,yc+r);
    let lines = [];
    for(let y=y1;y<=y2;y++){
      let dy = y-yc;
      let a = Math.sqrt(rr-dy*dy);
      let x1 = Math.floor(Math.max(0,xc-a));
      let x2 = Math.floor(Math.min(width-1,xc+a));
      lines.push(new Scanline(y, x1, x2));
    }
    return lines;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Circle;
