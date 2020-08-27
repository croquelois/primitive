/* jshint undef: true, unused: true, sub:true, browser:true, devel:true, esversion:8 */
/* globals Stats, Timer, Utils, Model */

var stats = new Stats();

function doOneTime(f){
  return new Promise(function(res){ setTimeout(() => res(f()),0); });
}
async function doNbTimes(f,n,label,info){
  let text = label + ": " + 0 + "/" + n;
  console.log(text);
  info.text(text);
  for(let i=0;i<n;i++){
    await doOneTime(f);
    let text = label + ": " + (i+1) + "/" + n;
    console.log(text);
    info.text(text);
  }
}

function drawModelImage(model,context){
  let newImg = context.createImageData(model.size.width, model.size.height);
  Utils.copy(newImg.data, model.getImage());
  context.putImageData(newImg, 0, 0);
}

async function apply(elem, info, params){
  stats = new Stats();
  const context = elem[0].getContext("2d"); 
  
  const width = context.canvas.width;
  const height = context.canvas.height;
  const size = {height, width};
  context.clearRect(0, 0, width, height);
  context.drawImage(document.getElementById("imgSrc"), 0, 0);
  let oldImg = context.getImageData(0, 0, width, height);
  
  let stop = stats.start("process");
  
  let bg = params.bg || Utils.averageImageColor(oldImg.data, size, 4);
  let model = new Model(oldImg.data, bg, size, params.dampener);
  drawModelImage(model,context);
  console.log(1, 0 + " " + (0.0).toFixed(3) + ", score=" + model.score.toFixed(6));
  console.log("count="+params.count+", mode=, alpha="+params.alpha+", repeat="+params.repeat+"");
  let timer = new Timer();
  timer.start();
  let frame = 0;
  await doNbTimes(() => {
    frame++;
    let n = 0;
    model.step(params.shapeType, params.alpha, params.repeat);
    let t = timer.get()/1000;
    console.log(""+frame+": t="+t.toFixed(3)+", score="+model.score.toFixed(6)+", n="+n+", n/s=" + n/t);
    drawModelImage(model,context);
  },params.count,params.shapeType,info);
  timer.stop();
  
  stop();
  stats.print();  
}

function handleDrop(e) {
  e.preventDefault();
  let reader = new FileReader();
  reader.readAsDataURL(e.dataTransfer.files[0]);
  reader.onloadend = () => document.getElementById("imgSrc").src = reader.result;
}

function resizeDest(){
  let imgSrc = document.getElementById("imgSrc");
  let result = document.getElementById("result");
  result.width = imgSrc.width;
  result.height = imgSrc.height;
}

function allowDrop(e) {
  e.preventDefault();
}

window.onload = function(){
  document.getElementById("imgSrc").addEventListener('dragover', allowDrop, false);
  document.getElementById("imgSrc").addEventListener('drop', handleDrop, false);
  document.getElementById("imgSrc").addEventListener('load', resizeDest, false);
  let params = {repeat:0,alpha:0.5};
  $("#run").click(() => {
    params.shapeType = $("#shape").val();
    params.count = $("#count").val();
    apply($("#result"), $("#info"), params);
  });
};