/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
/* globals Utils */
"use strict";

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  Utils = require("./Utils.js");
}
/* jshint ignore:end */

class Scanline {
  constructor(y, x1, x2, alpha){
    this.y = y;
    this.x1 = x1;
    this.x2 = x2;
    this.alpha = (alpha === undefined ? 1.0 : alpha);
  }
  static cropScanlines(lines, w, h){
    return lines.filter(line => {
      if(line.y < 0 || line.y >= h)
        return false;
      if(line.x1 >= w || line.x3 < 0)
        return false;
      line.x1 = Utils.clampInt(line.x1, 0, w-1);
      line.x2 = Utils.clampInt(line.x2, 0, w-1);
      return (line.x1 <= line.x2);
    });
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Scanline;