let shell = require('shelljs');
let fs = require('fs');
let path = require('path');//解析需要遍历的文件夹
let dist = '_src'
let docxDist = 'docxs'
shell.rm('-rf', dist);
shell.cp('-R', 'src', dist);
shell.rm('-rf', docxDist);
shell.mkdir(docxDist)
shell.cp('-R', 'src/img_des.txt', docxDist);
shell.cp('-R', 'src/imgs', docxDist + '/imgs');
shell.rm('-rf', docxDist + '/imgs/*.gif');
String.prototype.replaceAll = function (s1, s2) {
  return this.replace(new RegExp(s1, "gm"), s2);
};
// shell.mkdir(docxDist)
//调用文件遍历方法
fileDisplay(dist);

//文件遍历方法
function fileDisplay(filePath) {
  //shell.exec(`pwd`)
  //return
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath, function (err, files) {
    if (err) {
      console.warn(err)
    } else {
      //遍历读取到的文件列表
      files.forEach(function (filename) {
        //获取当前文件的绝对路径
        let filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir, function (eror, stats) {
          if (eror) {
            console.warn('获取文件stats失败');
          } else {
            let isFile = stats.isFile();//是文件
            let isDir = stats.isDirectory();//是文件夹
            if (isFile) {
              if (filename.endsWith('.md')) {
                let content = fs.readFileSync(filedir).toString()
                content = content.replaceAll('.md', '.docx').replaceAll('.gif', 'jpeg');
                fs.writeFileSync(filedir, content);
                let exfileName = filedir.replace('_src/', 'docxs/').replace(".md", ".docx");
                let v = exfileName.split('/');
                v.pop()
                let dir = v.join('/')
                // console.log(dir);
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, true)
                }
                // console.log(exfileName)
                filedir = filedir.replace('_src/', '');
                shell.exec(`cd _src && pandoc -s ${filedir} -o ../${exfileName}`)
              }
              // 读取文件内容
              //let content = fs.readFileSync(filedir, 'utf-8');
              //console.log(content);
            }
            if (isDir) {
              fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        })
      });
    }
  });
}
