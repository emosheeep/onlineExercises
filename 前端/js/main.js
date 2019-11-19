/**
 * @param {Object} id          上传文件id
 * @param {Object} callback    回调函数
 */
var loadQuestion = function(id, callback){
	let btn = document.getElementById(id)
	btn.onclick = function(event){
		var xhr = new XMLHttpRequest()
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				let result = JSON.parse(xhr.responseText)
				console.log(result)
				if (result.success) {
					callback(result.data)
				} else {
					callback(null)
				}
				
			}
		}
		xhr.open('get', "http://localhost:3000/question")
		xhr.send(null)
		btn.onclick = null
	}
}
/**
 * 作为回调函数,该部分是逻辑控制的核心
 * @param {Object} result   文件读取成功后的数据
 */
var main = function(data){
	// 创建题目数据管理对象
	var model = MVC.model,
		// 视图管理对象
		view = MVC.view,
		ctrl = MVC.ctrl

	if (!data){
		alert("未获取到数据!")
		return
	}
	//构造并初始化数据模型题目数据
	model.setData(data)
	//初始化试图视图模型
	view.init("container")
	// 首次渲染题目
	view.showQuestion(model.iterator.first())
	//执行控制器
	ctrl.init()
	
}
//加载题目并执行回调函数
loadQuestion("load", main)
