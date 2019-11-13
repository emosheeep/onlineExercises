var Observer = (function(question, view){
	// 消息
	var message = {},
		Watcher = {}
	return {
		setWatcher: function(key, value){
			Watcher[key] = value
		},
		getWatcher: function(key, value){
			return Watcher
		},
		//注册事件
		register: function(type, fn){
			if (!message[type]) {
				message[type] = []
			}
			message[type].push(fn)
		},
		//触发事件
		fire: function(type, data){
			if (!message[type]) {
				return
			}
			// 构建事件对象
			var event = {
				type: type,
				data: data
			}
			// 遍历消息列表
			message[type].forEach(function(fn){
				fn(event)
			})
		}
	}
})()

//传入事件目标dom和颜色,将目标的颜色改为指定颜色
Observer.register("changeStateColor", function(event){
	let data = event.data
	// 存在上一个元素则将上一个元素的active类移除
	data.preEle && data.preEle.classList.remove(data.color)
	data.target.classList.add(data.color,"defalut")
})

//将view视图上的正误结果反映到state状态上
Observer.register("viewToState", function(event){
	let data = event.data,
		watcher = Observer.getWatcher(),
		divs = watcher.question.stateManager.children
	// 如果答题正确,将state对应题号改为绿色(添加success类)
	console.log(data.status)
	if (data.status) {
		// 根据题号获取dom元素
		Observer.fire("changeStateColor", {
			target: divs[data.quesNum-1],
			color: "success"
		})
	} else {

		Observer.fire("changeStateColor", {
			target: divs[data.quesNum-1],
			color: "failed"
		})
	}
})