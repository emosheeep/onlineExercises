var express = require('express')
var app = express()
var excel = require("./myModules/xlsx.js")
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended:false}))
// 解决跨域问题
app.use(function(req, resp, next){
	resp.set("Access-Control-Allow-Origin","*")
	next()
})
app.post("/question", function(req, resp){
	console.log(req.body)
	var filename = req.body.filename,
		data = null
	for(let item of excel.files){
		let pos = item.indexOf(filename)
		if (pos != -1) {
			// 说明当前文件名存在，直接使用item即可
			data = excel.readFile(item)
			break
		}
	}
	if (data) {
		resp.json({
			success: true,
			data: data
		})
	} else {
		resp.json({
			success: false,
			msg: "没有该题库"
		})
	}
})
app.get("/files", function(req, resp){
	resp.status(200)
	resp.json(excel.files)
})
// 404和500页面
app.use(function(req, resp){
	resp.type('text/plain')
	resp.status(404)
	resp.send("404 - Not Found")
})
app.use(function(err, req, resp, next){
	console.log(err.stack)
	resp.type('text/plain')
	resp.status(500)
	resp.send("500 - Server Error")
})

app.listen(3000, function(){
	console.log("服务已启动！localhost:3000")
})

