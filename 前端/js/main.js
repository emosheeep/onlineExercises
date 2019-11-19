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

let btn = document.getElementById("load"),
	ul = document.getElementById("toLoad")
var xhr = new XMLHttpRequest()
xhr.onreadystatechange = function(){
	if(xhr.readyState == 4 && xhr.status == 200){
		let files = JSON.parse(xhr.responseText)
		files = files.map(function(item){
			// 保留文件名
			return item.slice(0,item.indexOf("."))
		})
		let fragment = document.createDocumentFragment()
		// 创建题目列表选项
		files.forEach(function(item){
			let li = document.createElement('li')
			li.title = item
			li.innerText = item
			fragment.appendChild(li)
		})
		ul.appendChild(fragment)
	}
}
xhr.open('get', "http://localhost:3000/files")
xhr.send(null)

// 题库列表绑定事件,事件委托
ul.onclick = function(event){
	var target = event.target,
		xhr = new XMLHttpRequest(),
		file = target.innerText
	// 过滤事件
	if(target.parentNode != ul){
		return
	}
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			let result = JSON.parse(xhr.responseText)
			console.log(result)
			if (result.success) {
				main(result.data)
			} else {
				main(null)
			}
		}
	}
	xhr.open('post', "http://localhost:3000/question")
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(`filename=${file}`)
}