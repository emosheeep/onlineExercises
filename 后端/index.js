var express = require('express')
var app = express()
var getQuestions = require("./xlsx.js")


app.get("/question", function(req, resp){
	var data = getQuestions("知识竞赛题库.xlsx")
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

