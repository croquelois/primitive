/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
/* globals Random */
"use strict";

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  Random = require("path");
}
/* jshint ignore:end */

class State {
  constructor(worker, shape, alpha){
    this.worker = worker;
    this.shape = shape;
    this.alpha = alpha;
    this.mutateAlpha = (alpha == 0);
    this.alpha = this.mutateAlpha ? 0.5 : alpha;
    this.score = -1;
  }
  
  copy(){
    let newState = new State(this.worker, this.shape.copy(), this.alpha);
    newState.mutateAlpha = this.mutateAlpha;
    newState.score = this.score;
    return newState;
  }
  
  energy(){
    if(this.score < 0)
      this.score = this.worker.energy(this.shape, this.alpha);
    return this.score;
  }
  
  doMove(){
    let oldState = this.copy();
    this.shape.mutate();
    if(this.mutateAlpha)
      this.alpha = Math.max(0,Math.min(1, this.alpha + 0.05*Random.normal()));
    this.score = -1;
    return oldState;
  }
  
  undoMove(oldState){
    this.shape = oldState.shape;
    this.alpha = oldState.alpha;
    this.score = oldState.score;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = State;