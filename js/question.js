/**
 * 题目数据管理模块
 * @param {Object} id  上传文件的元素id
 */
var Question = function(data){
	// 加载题库
	this.questions = data
	this.stateManager = null
	// 上一个元素的缓存
	this.preEle = null
	// 将题库数据根据视图进行适配
	this.init(data)
}
Question.prototype = {
	// 适配数据
	init: function(data){
		// 缓存适配数据
		let result = []
		data.forEach(function(item){
			// 构造适合视图的数据
			let temp = {
				num: parseInt(item[0]),
				question: item[1].trim(),
				list: [item[2], item[3], item[4], item[5]],
				answer: item[6].trim()
			}
			result.push(temp)
		})

		if (isNaN(result[0].num)) {
			result.shift()
		}
		// 替换原来的数据
		this.questions = result
		console.log(this.questions)
	},
	/**
	 * 题目状态管理,对错,以及题目数量等等
	 */
	createManager: function(id){
		var div = document.getElementById(id),
			// 视图缓存
			html = ''
		// i从1开始,因为第一行是表头
		for (let i=1; i<this.questions.length; i++) {
			html += `<div>${i}</div>`
		}
		div.innerHTML = html
		this.stateManager = div
	},
	/**
	 * 题目迭代器
	 */
	iterator: function(){
		if(this.questions.length == 0)
			throw new Error("数据还未读取！")
		// 当前索引值，默认为0
		var index = 0,
			items = this.questions
		return {
			first: function(){
				index = 0  // 矫正当前索引
				return items[index]
			},
			last: function(){
				index = items.length - 1
				return items[index]
			},
			pre: function(){
				console.log(index)
				if(--index >= 0){  //  如果索引值大于等于零获取相应元素
					return items[index]
				} else {
					index = 0
					return null
				}
			},
			next: function(){
				if(++index < items.length){  // 如果索引在范围内就获取元素
					return items[index]
				} else {
					//矫正index
					index = items.length - 1
					return null
				}
			},
			get: function(num){
				if (num >= 0 && num <items.length) {
					index = num  // 矫正index
					return items[index]
				} else return null
			}
		}
	}
}

/**
 * 题目视图管理模块
 * @param {Object} id  将视图渲染到对应id的dom元素中
 */
var QuestionView = function(id){
	this.init(id)
	// 当前题目信息
	this.currentQuestion = null
}
QuestionView.prototype = {
	/**
	 * 初始化视图
	 */
	init: function(id){
		let html = `
			<div class="panel panel-default questionBox">
				<div class="panel-heading header">
					<p id="title"></p>
				</div>
				<div class="panel-body body">
					<ol type="A" id="list">
						<li answer="A"></li>
						<li answer="B"></li>
						<li answer="C"></li>
						<li answer="D"></li>
					</ol>
				</div>
				<div class="panel-footer footer">
					<button type="button" id="preBtn" class="btn btn-default">上一题</button>
					<button type="button" id="nextBtn" class="btn btn-default">下一题</button>
				</div>
			</div>
		`
		// 初始化试图
		let div = document.getElementById(id)
		div.innerHTML = html
		// 初始化视图组件
		this.question = document.getElementById("title") //题目
		this.quesList = document.getElementById("list")  //选项列表
		this.preBtn = document.getElementById("preBtn")  //上一题按钮
		this.nextBtn = document.getElementById("nextBtn")//下一题按钮
	},
	/**
	 * 渲染数据
	 * @param {Object} data
	 */
	showQuestion: function(data){
		// 设置题目
		this.question.innerText = data.num + ". " + data.question
		// 遍历,设置选项
		let list = this.quesList.children
		Array.prototype.forEach.call(list, function(item, index){
			item.innerText = data.list[index]
		})
		//设置当前题目
		this.currentQuestion = data
		// 重置选项颜色
		this.resetColor()
		//设置正确答案
		this.answer = data.answer
		//重新绑定事件
		this.bindEvent()
	},
	/**
	 * 事件委托,绑定验证逻辑的事件
	 */
	bindEvent: function(){
		let _this = this
		// 移除之前添加但可能未被触发的事件,防止重复触发
		_this.quesList.onclick = null
		// 使用dom0级方式绑定事件,便于清除事件
		_this.quesList.onclick = function(event){
			let target = event.target
			// 由于利用委托,要防止点到父元素
			if (target.nodeName != "LI") {
				return
			}

			// flag为返回的判断结果对象
			let judgeResult = _this.judge(target)
			// 如果答题正确正确,自动下一题,并更新state状态
			if(judgeResult.status){
				setTimeout(function(){
					_this.nextBtn.click()
				}, 200)
			}
			judgeResult.quesNum = _this.currentQuestion["num"]
			Observer.fire("viewToState", judgeResult)
			
			// 触发之后移除事件防止多次触发
			_this.quesList.onclick = null
		}
	},
	/**
	 * 验证答案并设置题目状态
	 * @param  {[type]} myItem    [我的答案]
	 */
	judge: function(myItem){
		//获取选项列表
		let list = this.quesList.children,
			//获取我的答案
			myAns = myItem.getAttribute("answer"),
			//获取正确答案
			rightAns = this.currentQuestion["answer"],
			// 题正误状态
			status = true,
			// 获取正确项
			rightItem
		// 通过正确答案找到正确项
		for (let item of list) {
			let ans = item.getAttribute("answer")
			if (ans == rightAns) {
				rightItem = item
			}
		}

		// 比对正确项与我的选项,并设置状态
		if (myItem == rightItem) {
			myItem.classList.add("success")
		} else {
			myItem.classList.add("failed")
			rightItem.classList.add("success")
			status = false
		}
		return {
			status: status,
			answer: myAns,
			rightAns: rightAns
		}
	},
	/**
	 * [切换题目时,重置颜色]
	 */
	resetColor: function(){
		let list = this.quesList.children
		for (let item of list) {
			item.className = ""
		}
	}
}