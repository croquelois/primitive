/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
/* globals Optimize, Utils, State, Random, Triangle, Rectangle, Ellipse, Circle, RotatedRectangle */
"use strict";

/* jshint ignore:start */
if(typeof module !== 'undefined' && module.exports){
  Optimize = require("./Optimize.js");
  Utils = require("./Utils.js");
  State = require("./State.js");
  Random = require("./Random.js");
  Triangle = require("./Triangle.js");
  Rectangle = require("./Rectangle.js");
  Ellipse = require("./Ellipse.js");
  Circle = require("./Circle.js");
  RotatedRectangle = require("./RotatedRectangle.js");
}
/* jshint ignore:end */

class Worker {
  constructor(target, size, params){
    this.target = target;
    this.size = size;
    this.buffer = [];
    this.params = params;
  }
  init(current, score){
    this.current = current;
    this.score = score;
  }
  bestHillClimbState(shapeType, alpha, n, age, m){
    let bestEnergy;
    let bestState;
    for(let i=0;i<m;i++){
      let state = this.bestRandomState(shapeType, alpha, n);
      let before = state.energy();
      state = Optimize.hillClimb(state, age);
      let energy = state.energy();
      console.log(""+n+"x random: "+before.toFixed(6)+" -> "+age+"x hill climb: "+energy.toFixed(6));
      if(i == 0 || energy < bestEnergy){
        bestEnergy = energy;
        bestState = state;
      }
    }
    return bestState;
  }
  energy(shape, alpha){
    let lines = shape.rasterize();
    let color = Utils.computeColor(this.target, this.current, this.size, 4, lines, alpha);
    Utils.copyLines(this.buffer, this.current, this.size, 4, lines);
    Utils.drawLines(this.buffer, this.size, color, lines);
    return Utils.differencePartial(this.target, this.current, this.buffer, this.size, 4, this.score, lines, this.params);
  }
  bestRandomState(shapeType, alpha, n){
    let bestEnergy;
    let bestState;
    for(let i=0;i<n;i++){
      let state = this.randomState(shapeType, alpha);
      let energy = state.energy();
      if(i == 0 || energy < bestEnergy){
        bestEnergy = energy;
        bestState = state;
      }
    }
    return bestState;
  }  
  randomState(shapeType, alpha){
    if(!shapeType)
      shapeType = Random.choice(["Triangle", "Rectangle", "Ellipse", "Circle", "RotatedRectangle", "RotatedEllipse"]);
    switch(shapeType){
      case "Triangle":
        return new State(this, Triangle.newRandom(this.size), alpha);
      case "Rectangle":
        return new State(this, Rectangle.newRandom(this.size), alpha);
      case "Ellipse":
        return new State(this, Ellipse.newRandom(this.size), alpha);
      case "Circle":
        return new State(this, Circle.newRandom(this.size), alpha);
      case "RotatedRectangle":
        return new State(this, RotatedRectangle.newRandom(this.size), alpha);
      case "RotatedEllipse":
        return new State(this, RotatedEllipse.newRandom(this.size), alpha);
    }
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Worker;