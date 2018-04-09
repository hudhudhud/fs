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

//图片文件服务器
//http://expressjs.com/en/starter/static-files.html
// app.use(express.static('public'))
// Now, you can load the files that are in the public directory:

// http://localhost:3000/images/kitten.jpg
// http://localhost:3000/css/style.css
// http://localhost:3000/js/app.js
// http://localhost:3000/hello.html
// Express looks up the files relative to the static directory, so the name of the static directory is not part of the URL.
// To use multiple static assets directories, call the express.static middleware function multiple times:

// app.use(express.static('public'))
// app.use(express.static('files'))
// Express looks up the files in the order in which you set the static directories with the express.static middleware function.

// To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the express.static function, specify a mount path for the static directory, as shown below:
// app.use('/static', express.static('public'))
// Now, you can load the files that are in the public directory from the /static path prefix.

// http://localhost:3000/static/images/kitten.jpg
// http://localhost:3000/static/css/style.css
// http://localhost:3000/static/js/app.js
// http://localhost:3000/static/hello.html

app.use("/img",express.static("img"))


var server=app.listen(80,function(argument) {
	console.log('listening at 80')
})

