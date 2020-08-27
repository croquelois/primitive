/* jshint undef: true, unused: true, sub:true, node:true, esversion:8 */
"use strict";

var Utils = (function(){

function copy(output, input){
  if(!input){
    input = output;
    output = [];
  }
  for(let i=0;i<input.length;i++)
    output[i] = input[i];
  return output;
}

function emptyChannel(size){
  const {height, width} = size;  
  let data = [];
  for(let i=0;i<width*height;i++)
    data[i] = 0;
  return data;
}

function extractChannel(data, size, nb){
  const {height, width} = size;
  let channels = [];
  for(let i=0;i<nb;i++)
    channels.push([]);
  for(let py = 0; py < height; py++){
    for(let px = 0; px < width; px++){
      let idx = (width * py + px);
      for(let i=0;i<nb;i++)
        channels[i][idx] = data[idx*nb+i];
    }
  }
  return channels;
}

function mergeChannel(channels, size){
  const {height, width} = size;
  const nb = channels.length;
  let data = [];
  for(let py = 0; py < height; py++){
    for(let px = 0; px < width; px++){
      let idx = (width * py + px);
      for(let i=0;i<nb;i++)
        data[idx*nb+i] = channels[i][idx];
    }
  }
  return data;
}

function truncation(data, level){
  for(let i=0;i<data.length;i++)
    if(Math.abs(data[i]) < level)
      data[i] = 0;
}

function quantization(data, level){
  for(let i=0;i<data.length;i++){
    let v = data[i];
    if(v >= level)
      data[i] = 1;
    else if(-v <= -level)
      data[i] = -1;
    else
      data[i] = 0;
  }
}

function sortTheLast(array, comparator) {
  if(!comparator)
    comparator = (a,b) => b-a;
  const item = array[array.length-1];
  let min = 0;
  let max = array.length-1;
  let index = Math.floor(0.5*(min + max));
  while(max > min){
    if(comparator(item, array[index]) < 0)
      max = index;
    else
      min = index + 1;
    index = Math.floor(0.5 * (min + max));
  }
  for(let i=array.length-2;i>=index;i--)
    array[i+1] = array[i];
  array[index] = item;
}

function searchLimit(data, nb){
  let ret = [];
  for(let i=0;i<data.length;i++){
    let v = Math.abs(data[i]);
    if(ret.length < nb || ret[nb-1] < v){
      if(ret.length < nb)
        ret.push(v);
      else
        ret[ret.length-1] = v;
      sortTheLast(ret);
    }
  }
  return ret[ret.length-1];
}

function getTruncatedSparse(data, size, nb){
  const {width} = size;
  const comparator = (a,b) => b.av - a.av;
  let sparse = [];
  nb = nb - 1;
  for(let i=1;i<data.length;i++){
    let v = data[i];
    let av = Math.abs(v);
    let x = i % width;
    let y = Math.floor(i / width);
    let elem = {x,y,v,av};
    if(sparse.length < nb || comparator(sparse[nb-1], elem) > 0){
      if(sparse.length < nb)
        sparse.push(elem);
      else
        sparse[sparse.length-1] = elem;
      sortTheLast(sparse, comparator);
    }
  }
  sparse.unshift({x:0,y:0,v:data[0],av:Math.abs(data[0])});
  return sparse;
}

function reconstructFromSparse(sparse, size){
  const {width} = size;
  let data = emptyChannel(size);
  sparse.forEach(p => data[p.y*width+p.x] = p.v);
  return data;
}

function averageImageColor(data, size, nb){
  const {height, width} = size;
  let color = [];
  
  for(let i=0;i<nb;i++)
    color[i] = 0;
  
  for(let py = 0; py < height; py++){
    for(let px = 0; px < width; px++){
      let idx = (width * py + px);
      for(let i=0;i<nb;i++)
        color[i] += data[idx*nb+i];
    }
  }
  
  for(let i=0;i<nb;i++)
    color[i] /= width*height;
  
  return color;
}

function uniformImage(color, size){
  const {height, width} = size;
  const nb = color.length;
  let data = [];
  
  for(let py = 0; py < height; py++){
    for(let px = 0; px < width; px++){
      let idx = (width * py + px);
      for(let i=0;i<nb;i++)
        data[idx*nb+i] = color[i];
    }
  }
  
  return data;
}

function dampener(/*x, y, params*/){
  return 1;
}

function differenceFull(a, b, size, nb, params){
  const {height, width} = size;
  let total = 0;
  for(let py = 0; py < height; py++){
    for(let px = 0; px < width; px++){
      let idx = (width * py + px);
      let dist = 0;
      for(let i=0;i<nb;i++){
        let off = idx*nb+i;
        let d = (a[off] - b[off]);
        dist += d*d;
      }
      total += dist * 1;//dampener(px, py, params);
    }
  }
  return Math.sqrt(total/(width*height*nb))/255;
}

function differencePartial(tgt, bfr, aft, size, nb, score, lines, params){
  const {height, width} = size;
  let total = score*score*255*255*height*width*nb;
  lines.forEach(line => {
    let offY = width * line.y;
    for(let x = line.x1; x <= line.x2; x++){
      let d = 1;//dampener(x, line.y, params);
      for(let j=0;j<nb;j++){
        let off = (offY+x)*nb + j;
        let tb = tgt[off] - bfr[off];
        let ta = tgt[off] - aft[off];
        total -= (tb*tb) * d;
        total += (ta*ta) * d;
        if(!isFinite(total))
          throw "total is not finite";
      }
    }
  });
  return Math.sqrt(total/(width*height*nb))/255;
}

function copyLines(dst, src, size, nb, lines){
  const {width} = size;
  lines.forEach(line => {
    let offY = width * line.y;
    for(let i = (offY + line.x1) * nb; i < (offY + line.x2 + 1) * nb; i++)
      dst[i] = src[i];
  });
}

function computeColor(target, current, size, nb, lines, alpha){
  const {width} = size;
  let sum = [];
  for(let j=0;j<nb-1;j++)
    sum[j] = 0;
  let count = 0;
  let a = 1/alpha;
  lines.forEach(line => {
    let i = (width * line.y + line.x1) * nb;
    for(let x=line.x1;x<=line.x2;x++){
      for(let j=0;j<nb-1;j++){
        let t = target[i+j];
        let c = current[i+j];
        sum[j] += (t-c)*a + c;
      }
      i += nb;
      count++;
    }
  });
  if(count == 0)
    return [0,0,0,0];
  for(let j=0;j<nb-1;j++)
    sum[j] = Utils.clampInt(sum[j]/count, 0, 255);
  sum[3] = Utils.clampInt(alpha*255, 0, 255);
  return sum;
}

function clamp(v, m, M){
  return Math.max(m, Math.min(M, v));
}

function clampInt(v, m, M){
  return Math.floor(Math.max(m, Math.min(M, v)));
}

function drawLines(dst, size, color, lines){
  const {width} = size;
  const nb = color.length;
  let a = color[nb-1]/255;
  lines.forEach(line => {
    let offY = width * line.y;
    for(let i = (offY + line.x1); i <= (offY + line.x2); i++){
      for(let j=0;j<nb-1;j++){
        let d = dst[i*nb+j];
        let c = color[j];
        dst[i*nb+j] = Utils.clampInt(d*(1-a) + c*a, 0, 255);
      }
      dst[i*nb+nb-1] = 255;
    }
  });
}
      
return {
  extractChannel,
  mergeChannel,
  searchLimit,
  truncation,
  copy,
  quantization,
  getTruncatedSparse,
  reconstructFromSparse,
  averageImageColor,
  uniformImage,
  differenceFull,
  clampInt,
  clamp,
  computeColor,
  copyLines,
  drawLines,
  differencePartial
};

})();

if(typeof module !== 'undefined' && module.exports)
  module.exports = Utils;