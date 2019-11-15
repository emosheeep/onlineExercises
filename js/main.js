/**
 * @param {Object} id          上传文件id
 * @param {Object} callback    回调函数
 */
var loadQuestion = function(id, callback){
	let input = document.getElementById(id)
	input.addEventListener("change", function(event){
		let files = event.target.files,
			fr = new FileReader()
		fr.onload = function(e){
			try{
				var data = e.target.result,
					workbook = XLSX.read(data, {
						type: 'binary'
					}),
					// 存储数据
					result = []
			}catch(e){
				console.error("文件类型不正确")
				return
			}
			// 遍历每张表
			for (let sheet in workbook.Sheets) {
				if (workbook.Sheets.hasOwnProperty(sheet)){
					let datas = workbook.Sheets[sheet]
					result = result.concat(XLSX.utils.sheet_to_json(datas))
					break //读取第一张表，选择题
				}
			}
			
			// 格式化题库
			let questions = [],
				//缓存push方法
				push = [].push
			for (let question of result){
				// 每一道题目的缓存
				let temp = {}
				Object.keys(question).forEach(function(item){
					push.call(temp, question[item])
				})
				questions.push(temp)
			}
			
			// 回调函数传入数据
			callback(questions)
		}
		fr.onprogress = function(event){
			console.log(event.loaded/files[0].size*100 + '%')
		}
		fr.readAsBinaryString(files[0])
	})
}
/**
 * 作为回调函数,该部分是逻辑控制的核心
 * @param {Object} result   文件读取成功后的数据
 */
var main = function(result){
	
	// 创建题目数据管理对象
	var model = MVC.model,
		// 视图管理对象
		view = MVC.view,
		ctrl = MVC.ctrl

	//构造并初始化数据模型题目数据
	model.matchData(result)
	//初始化试图视图模型
	view.init("container")
	// 首次渲染题目
	view.showQuestion(model.iterator.first())
	//执行控制器
	ctrl.init()
	
}
//加载题目并执行回调函数
loadQuestion("file", main)
