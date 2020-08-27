/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
var Random = (function(){

const rand = Math.random;

class Random {
  static rand(){
    return rand();
  }
  
  static integer(n){
    return Math.floor(rand()*n);
  }
  
  static integer1(n){
    return 1+Math.floor(rand()*n);
  }
  
  static range(s,e){
    return s+Math.floor(rand()*((e-s)+1));
  }
  
  static choice(list){
    return list[Math.floor(Math.random()*list.length)];
  }
  
  static bool(){
    return rand()<0.5;
  }
}

Random.normal = (function(random){
  let spare;
  return function(){
    if(spare !== undefined){
      let v = spare;
      spare = undefined;
      return v;
    }
    var x, y, r;
    do {
      x = random() * 2 - 1;
      y = random() * 2 - 1;
      r = x * x + y * y;
    } while (!r || r > 1);
    r = Math.sqrt(-2 * Math.log(r) / r);
    spare = y * r;
    return x * r;
  };
})(Math.random);

return Random;
})();

if(typeof module !== 'undefined' && module.exports)
  module.exports = Random;