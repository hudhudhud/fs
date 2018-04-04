const http = require("http")
const fs = require("fs")
const url = require("url")
const path = require("path")
const process = require("process")
const mime = require("mime") //获取文件content-type

const port = 8989

let root = process.cwd() //获取当前工作目录
let server = http.createServer(function(require, response) {
  let dir = url.parse(require.url).pathname //以防止请求路径有querysring等，所以只需要取跟目录之后的文件路径
  let filePath = path.join(root, dir)

  new getStat(filePath).then(data => {
    if (data.isFile()) { //如果是文件，直接把文件内容写到页面
      return writeFile(filePath).then(d => {
        response.writeHead(200, {
          'Content-Type': mime.getType(filePath)
        })
        response.end(d)
      })
    } else if (data.isDirectory()) { //如果是路径，读取路径内的所有路径，依次写到页面，若还是为路径，则后面要加/以保证之后能取相对路径
      return new Promise((resolve, reject) => {
        fs.readdir(filePath, (err, data) => {
          if (err) reject(err)
          else resolve(data)
        })
      }).then(paths => {
        return Promise.all(paths.map(d => {
          //return writeDir(path.join(filePath, d), d)
        })).then(links => {
          response.writeHead(200, {
            'Content-Type': mime.getType("a.html")
          })
          response.end(links.join(" "))
        })
      })
    }
  }, error => {
    response.writeHead(404, {
      'Content-Type': mime.getType('a.html')
    })
    response.end('404 Not Found')
  })
})

server.listen(port, d => {
  console.log("server is listening on ", port)
})

function writeFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

}

function writeDir(fullPath, path) {
  return getStat(fullPath)
    .then(data => {
      var direc = data.isDirectory() ? "/" : ""
      return `<a href=${path+direc}>${path}</a><br>`
    })
}

function getStat(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}