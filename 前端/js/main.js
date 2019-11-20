/**
 * 事件防抖函数
 */
function debounce(fn, wait) {    
    var timeout = null
    return function(event) {        
        if(timeout !== null){
			clearTimeout(timeout)
		}        
        timeout = setTimeout(function(){
			fn.call(null, event)
		}, wait)   
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
	//重置数据对象
	model.reset()
	view.reset()
	//构造并初始化数据模型题目数据
	model.setData(data)
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

// 题库按钮的点击事件
var ulClickHandler = function(event){
	var target = event.target,
		file = target.innerText
	// 过滤事件
	if(target.parentNode != ul){
		return
	}
	// 检查本地有没有缓存当前题目信息
	var storage = window.sessionStorage,
		data = storage.getItem(file)
	if (data) {
		main(JSON.parse(data))
	} else {
		// 如果本地不存在则从服务器获取数据
		var xhr = new XMLHttpRequest()
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				let result = JSON.parse(xhr.responseText)
				if (result.success) {
					main(result.data)
					// 将数据缓存到本地,以便下次访问
					storage.setItem(file, JSON.stringify(result.data))
				} else {
					main(null)
				}
			}
		}
		xhr.open('post', "http://localhost:3000/question")
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(`filename=${file}`)
	}
	// 关闭题库面板
	$(ul).slideToggle(200)
	$("#answerSheet").css("visibility","visible")
}
// 题库列表绑定事件,事件委托
ul.addEventListener("click", debounce(ulClickHandler, 150), false)
ul.addEventListener("mousedown", function(event){
	event.target.classList.add("active")
}, false)
ul.addEventListener("mouseup", function(event){
	event.target.classList.remove("active")
}, false)
var btnClickHandler = function(event){
	$(ul).slideToggle(200)
}
btn.onclick = debounce(btnClickHandler, 200)
