/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
/* globals Optimize, Utils, Worker */

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  Optimize = require("./Optimize.js");
  Utils = require("./Utils.js");
  Worker = require("./Worker.js");
}
/* jshint ignore:end */

class Model {
  constructor(target, bg, size, params){
    this.target = target;
    this.current = Utils.uniformImage(bg, size);
    this.size = size;
    this.params = params;
    this.score = Utils.differenceFull(this.target, this.current, size, 4, params);
  }
  step(shapeType, alpha, n){
    let worker = new Worker(this.target, this.size, this.params);
    worker.init(this.current, this.score);
    let state = worker.bestHillClimbState(shapeType, alpha, 1000, 100, 16);
    //let state = worker.randomState(shapeType, alpha);
    this.add(state.shape, state.alpha);
    console.log(Utils.differenceFull(this.target, this.current, this.size, 4, this.params));
    for(let i=0;i<n;i++){
      worker.init(this.current, this.score);
      let a = state.energy();
      state = Optimize.hillClimb(state, 100);
      let b = state.energy();
      if(a == b)
        break;
      this.add(state.shape, state.alpha);
    }
  }
  add(shape, alpha){
    let before = Utils.copy(this.current);
    let lines = shape.rasterize();
    let color = Utils.computeColor(this.target, this.current, this.size, 4, lines, alpha);
    Utils.drawLines(this.current, this.size, color, lines);
    this.score = Utils.differencePartial(this.target, before, this.current, this.size, 4, this.score, lines, this.params);
  }
  getImage(){
    return this.current;
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Model;