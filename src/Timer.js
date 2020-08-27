/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
"use strict";

class Timer {
  constructor(){ this.acc = 0; }
  reset(){ this.acc = 0; }
  start(){ this.acc -= (new Date()).valueOf(); }
  stop(){ this.acc += (new Date()).valueOf(); }
  get(){ return this.acc < 0 ? this.acc+(new Date()).valueOf() : this.acc; }
  getString(){ return (this.get()/1000).toFixed(2) + "s"; }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Timer;