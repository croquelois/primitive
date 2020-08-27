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

class Ellipse {
  constructor(size){
    this.size = size;
    this.c = [0,0];
    this.r = [1,1];
  }
  static newRandom(size){
    let ellipse = new Ellipse(size);
    const {width, height} = size;
    ellipse.c = [Random.integer(width), Random.integer(height)];
    ellipse.r = [Random.range(1,32), Random.range(1,32)];
    return ellipse;
  }
  copy(){
    let ellipse = new Ellipse(this.size);
    ellipse.c = this.c.slice();
    ellipse.r = this.r.slice();
    return ellipse;
  }
  mutate(){
    const {width, height} = this.size;
    const m = 16;
    switch(Random.integer(2)){
      case 0:
        this.c[0] = Utils.clampInt(this.c[0]+Math.floor(Random.normal()*m), 0, width-1);
        this.c[1] = Utils.clampInt(this.c[1]+Math.floor(Random.normal()*m), 0, height-1);
      break;
      case 1:
        this.r[0] = Utils.clampInt(this.r[0]+Math.floor(Random.normal()*m), 1, width-1);
      break;
      case 2:
        this.r[1] = Utils.clampInt(this.r[1]+Math.floor(Random.normal()*m), 1, height-1);
      break;
    }
  }
  rasterize(){
    const {width, height} = this.size;
    let [xr,yr] = this.r;
    let rr = yr*yr;
    let [xc,yc] = this.c;
    let y1 = Math.max(0,yc-yr);
    let y2 = Math.min(height-1,yc+yr);
    let lines = [];
    for(let y=y1;y<=y2;y++){
      let dy = y-yc;
      let a = xr*Math.sqrt(1-dy*dy/rr);
      let x1 = Math.floor(Math.max(0,xc-a));
      let x2 = Math.floor(Math.min(width-1,xc+a));
      lines.push(new Scanline(y, x1, x2));
    }
    return lines;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Ellipse;
