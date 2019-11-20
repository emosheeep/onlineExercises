
var xlsx = require('xlsx'),
	fs = require('fs')

// 格式化题库
function formatQuestion(data){
	var result = [],
		//缓存push方法
		push = [].push
	for (let question of data){
		// 用来缓存题目对象
		let temp = {}
		// 将题目对象数组化便于访问
		Object.keys(question).forEach(function(item){
			push.call(temp, question[item])
		})
		// 将题目对象重新格式化
		temp = {
			id: parseInt(temp[0]),
			title: temp[1].trim(),
			list: [temp[2], temp[3], temp[4], temp[5]],
			answer: temp[6].trim().toUpperCase()
		}
		// 保存题目
		result.push(temp)
	}
	return result
}	

// 读取目录下所有题库,该目录是相对于index.js的目录
const dir = "./questions"

module.exports = {
	getFileNames: function(){
		return fs.readdirSync(dir)
	},
	readFile: function(filename){
		const workbook = xlsx.readFile(`${dir}/${filename}`),
			sheetNames = workbook.SheetNames,
			worksheet = workbook.Sheets[sheetNames[0]],
			data = xlsx.utils.sheet_to_json(worksheet)
		return formatQuestion(data)
	}
}
	


