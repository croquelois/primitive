/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
"use strict";

class Stats {
  constructor(){
    this.data = {};
  }
  
  start(name){
    let data = (this.data[name] = (this.data[name] || {sum:0,nb:0}));
    let start = (new Date()).valueOf();
    return function(){
      data.sum += (new Date()).valueOf() - start;
      data.nb += 1;
    };
  }
  
  print(){
    Object.keys(this.data).map(name => ({name, data: this.data[name]})).forEach(function(stat){
      const {sum, nb} = stat.data;
      const name = stat.name;
      console.log("" + name + " :" + (sum/1000).toFixed(2) + "s (n:" + nb + ")");
    });
  }
}

if(typeof module !== 'undefined' && module.exports)
  module.exports = Stats;