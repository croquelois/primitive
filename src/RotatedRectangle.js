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

class RotatedRectangle {
  constructor(size){
    this.size = size;
    this.sx = 0;
    this.sy = 0;
    this.x = 0;
    this.y = 0;
    this.angle = 0;
  }
  static newRandom(size){
    let rectangle = new RotatedRectangle(size);
    const {height, width} = size;
    rectangle.x = Random.integer(width);
    rectangle.y = Random.integer(height);
    rectangle.sx = Random.range(1,32);
    rectangle.sy = Random.range(1,32);
    rectangle.angle = Random.rand()*2*Math.PI;
    rectangle.mutate();
    return rectangle;
  }
  copy(){
    let rectangle = new RotatedRectangle(this.size);
    rectangle.sx = this.sx;
    rectangle.sy = this.sy;
    rectangle.x = this.x;
    rectangle.y = this.y;
    rectangle.angle = this.angle;
    return rectangle;
  }
  mutate(){
    const {height, width} = this.size;
    const m = 16;
    switch(Random.integer(2)){
    case 0:
      this.x = Utils.clampInt(this.x+Math.floor(Random.normal()*m), 0, width-1);
      this.y = Utils.clampInt(this.y+Math.floor(Random.normal()*m), 0, height-1);
      break;
    case 1:
      this.sx = Utils.clampInt(this.sx+Math.floor(Random.normal()*m), 1, width-1);
      this.sy = Utils.clampInt(this.sy+Math.floor(Random.normal()*m), 1, height-1);
      break;
    case 2:
      this.angle += 0.035*Random.normal()*m;
      break;
    }
  }
  rasterize(){
    function rotate(xy, theta){
      let rx = xy[0]*Math.cos(theta) - xy[1]*Math.sin(theta);
      let ry = xy[0]*Math.sin(theta) + xy[1]*Math.cos(theta);
      return [rx, ry];
    }
    const {height, width} = this.size;
    let {sx,sy,x,y,angle} = this;
    let [rx1, ry1] = rotate([-sx/2, -sy/2], angle);
    let [rx2, ry2] = rotate([sx/2, -sy/2], angle);
    let [rx3, ry3] = rotate([sx/2, sy/2], angle);
    let [rx4, ry4] = rotate([-sx/2, sy/2], angle);
    let [x1, y1] = [rx1+x, ry1+y];
    let [x2, y2] = [rx2+x, ry2+y];
    let [x3, y3] = [rx3+x, ry3+y];
    let [x4, y4] = [rx4+x, ry4+y];
    let miny = Math.floor(Math.min(y1,y2,y3,y4));
    let maxy = Math.floor(Math.max(y1,y2,y3,y4));
    let n = Math.floor(maxy - miny + 1);
    let min = [];
    let max = [];
    for(let i=0;i<n;i++){
      min[i] = width;
      max[i] = 0;
    }    
    let xs = [x1, x2, x3, x4, x1];
    let ys = [y1, y2, y3, y4, y1];
    for(let i=0;i<4;i++){
      [x, y] = [xs[i], ys[i]];
      let [dx, dy] = [(xs[i+1]-xs[i]), (ys[i+1]-ys[i])];
      let count = Math.floor(Math.sqrt(dx*dx+dy*dy))*2;
      for(let j=0;j<count;j++){
        let t = j/(count-1);
        let xi = Math.floor(x + dx*t);
        let yi = Math.floor(y+dy*t) - miny;
        min[yi] = Math.min(min[yi], xi);
        max[yi] = Math.max(max[yi], xi);
      }
    }
    let lines = [];
    for(let i=0;i<n;i++){
      let y = miny + i;
      if(y < 0 || y >= height)
        continue;
      let a = Math.max(min[i], 0);
      let b = Math.min(max[i], width-1);
      if(!isFinite(a) || Math.floor(a) != a)        
        throw "not an integer";
      if(!isFinite(b) || Math.floor(b) != b)
        throw "not an integer";      
      if(b >= a)
        lines.push(new Scanline(y, a, b));
    }
    return lines;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = RotatedRectangle;