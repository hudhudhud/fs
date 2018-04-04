var express=require('express')
var app=express()
var request=require('request')
var cheerio=require('cheerio')


const fs = require("fs")
const mime = require("mime") //获取文件content-type



var paUrl='http://ifeve.com/'
var currPage=1
var headhtml=`<head>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<style>
			body{font-family:"微软雅黑"}
		    @media screen and (max-width:414px) {
		      body{
		            background:#F9F2E2;
		      }
		    }
		    @media screen and (min-width:415px){
		    	body{
		    		background:pink;
		    	}
		    }
		    a{text-decoration:none;color:blue}
		    </style>
			</head>`
app.get('/',function(req,res) {
	 res.redirect(302, '/page/1') //相对当前url的根
})
app.get('/page/:pageNum',function(req,res) {
	currPage=req.params.pageNum?req.params.pageNum:1
	request(paUrl+`/page/${req.params.pageNum}/`,function (error,response,body) {
		if(!error&&response.statusCode==200){
			$=cheerio.load(body)
			var article=[]
			$('.post').each((i,item)=>{
				var title=$(item).children(".title").children("a")
				var content=$(item).children(".post_content")
				article.push({
					title:$(title).text(),
					href:$(title).attr("href").substr(paUrl.length),
					content:$(content).text()
				})
			})
			// res.json({length:$('.post').length,
			// 		  article
			// 		})
			var prePage=currPage>1?currPage-1:0
			var nextPage=currPage-0+1
			var pagerHtml=`<div>${prePage>0?"<a style='margin-right:10px' href='/page/${prePage}'>上一页</a>":""}<a href='/page/${nextPage}'>下一页</a></div>`
			var html=`<html style='margin:0;padding:0;width:100%;'>
			${headhtml}
			<body style='margin:0;padding:0;'>
			${pagerHtml}
			<div style='width:100%;box-sizing:border-box;padding:15px;'>
			<ol style='width:100%;margin:auto;box-sizing:border-box;padding-left:15px'>`
			article.forEach((item,i)=>{
				html+=`<li><p><a href='/article/${item.href}'>${item.title}</a></p><p>${item.content}</p></li>`
			})
			html+=`</ol></div>
			</body></html>`
			res.send(html)
		}
	})

})
app.get('/article/:path',function(req,res) {
	//res.send(req.params.path)
	request(paUrl+req.params.path,function (error,response,body) {
		if(!error&&response.statusCode==200){
			$=cheerio.load(body)
			var article=[]
			var html=''
			var title=$('.post').children(".title").html()
			var children=$('.post').children(".post_content").children()
			for(var i=0;i<children.length-4;i++){//去掉最后四个广告元素
				html+=$.html(children[i])
			}
			res.send(headhtml+title+html)
		}
	})
})

app.get('/img/:dir',function(req,res) {
    var dir=req.params.dir
    var filePath=req.hostname+dir
    new getStat(filePath).then(data => {
    if (data.isFile()) { //如果是文件，直接把文件内容写到页面
      return writeFile(filePath).then(d => {
        // res.writeHead(200, {
        //   'Content-Type': mime.getType(filePath)
        // })
        res.send(d)
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
          // res.writeHead(200, {
          //   'Content-Type': mime.getType("a.html")
          // })
          res.send(links.join(" "))
        })
      })
    }
  }, error => {
    res.writeHead(404, {
      'Content-Type': mime.getType('a.html')
    })
    res.send('404 Not Found')
  })
	res.send()
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



var server=app.listen(9090,function(argument) {
	console.log('listening at 9090')
})

