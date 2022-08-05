const qr = require('qr-image');
const {Image, createCanvas} = require('canvas')
const fs = require('fs')
let data = fs.readFileSync(__dirname + '/src/imgs/gif.txt')
let images = data.toString().split("\n");
let str='';
images.forEach((e) => {
  if (e.trim()) {
    console.log(e);
    let gifUrl = createQRcode(e)
    str+=`${e}      ${gifUrl}\n`;
  }
})

fs.writeFileSync(__dirname + '/src/imgs/gif-urls.txt',str);


function createQRcode(str) {
  let gifUrl=`https://github.com/flutterchina/flutter_in_action_2nd/blob/main/src/imgs/${str}.gif`;
  let svg_string = qr.imageSync(gifUrl, {type: 'png'});
  const canvas = createCanvas(200, 240)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const img = new Image()
  img.onload = () => ctx.drawImage(img, 0, 0, 200, 200)
  img.src = svg_string;

  ctx.font = '15px Impact'
  ctx.fillStyle = '#000'
  let _str = `图${str} (扫码查看动图)`;
  let text = ctx.measureText(_str)
  ctx.fillText(_str, (200 - text.width) / 2, 215)

  const out = fs.createWriteStream(__dirname + `/src/imgs/${str}.jpeg`)
  const stream = canvas.createJPEGStream()
  stream.pipe(out)
  return gifUrl;
}

