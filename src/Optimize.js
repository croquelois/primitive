/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
"use strict";

class Optimize {
  static hillClimb(state, maxAge){
    state = state.copy();
    let bestState = state.copy();
    let bestEnergy = state.energy();
    for(let age=0;age<maxAge;age++){
      let undo = state.doMove();
      let energy = state.energy();
      if(energy >= bestEnergy){
        state.undoMove(undo);
      }else{
        bestEnergy = energy;
        bestState = state.copy();
        age = -1;
      }
    }
    return bestState;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Optimize;