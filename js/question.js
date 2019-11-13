/**
 * 题目数据管理模块
 * @param {Object} id  上传文件的元素id
 */
var Question = function(data){
	// 加载题库
	this.questions = data
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
		
		// 去掉表头
		if (isNaN(result[0].num)) {
			result.shift()
		}
		// 替换原来的数据
		this.questions = result
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
	// 答题卡
	this.answerSheet = {
		// dom元素
		element: null,
		// 答题数据
		state: {},
		changeColor: function(){}
	}
	// 上一个元素的缓存
	this.preEle = null
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
		//缓存当前题目
		this.currentQuestion = data
		// 重置选项颜色
		this.resetColor()
		
		//传入题号,检测答题信息,并设置题目状态
		let isDone = this.checkState(this.currentQuestion["num"])
		// 移除之前添加但可能未被触发的事件,防止重复触发
		this.quesList.onclick = null
		//如果题目没有做过则重新绑定事件
		if(!isDone){
			this.bindEvent()
		}
		
		// 获取答题卡当前元素
		let target = this.answerSheet.element.children[data.num-1]
		//答题卡对应变色
		Observer.fire("changeStateColor", {
			color: "active",
			target: target,
			preEle: this.preEle
		})
		// 缓存上一个元素
		this.preEle = target
	},
	/**
	 * 创建答题卡
	 * id        答题卡id
	 * length    题目数量
	 */
	createAnswerSheet: function(id, length){
		var div = document.getElementById(id),
			// 视图缓存
			html = ''
		// 没有表头，第一行就是数据
		for (let i=1; i<=length; i++) {
			html += `<div>${i}</div>`
		}
		div.innerHTML = html
		this.answerSheet.element = div
		// 添加方法
		var _this = this
		/**
		 * @param {Object} quesInfo  题目信息
		 */
		this.answerSheet.changeColor = function(quesInfo){
			Observer.fire("viewToState", quesInfo)
		}
	},
	/**
	 * 事件委托,绑定验证逻辑的事件
	 */
	bindEvent: function(){
		let _this = this
		// 使用dom0级方式绑定事件,便于清除事件
		_this.quesList.onclick = function(event){
			let target = event.target
			// 由于利用委托,要防止点到父元素
			if (target.nodeName != "LI") {
				return
			}
			let myAns = target.getAttribute("answer"),
				rightAns = _this.currentQuestion["answer"]
			// flag为返回的判断结果对象
			let judgeResult = _this.judge(myAns, rightAns)
			// 如果答题正确正确,自动下一题,并更新state状态
			if(judgeResult.status){
				setTimeout(function(){
					_this.nextBtn.click()
				}, 200)
			}
			// 增强对象，添加题号
			judgeResult.quesNum = _this.currentQuestion["num"]
			// 保存每道题的答题信息
			_this.answerSheet.state[judgeResult.quesNum] = judgeResult
			// 改变答题卡信息
			_this.answerSheet.changeColor(judgeResult)
			// 触发之后移除事件防止多次触发
			_this.quesList.onclick = null
		}
	},
	/**
	 * 验证答案并设置题目状态
	 * @param  {[type]} myAns    [我的答案]
	 */
	judge: function(myAns, rightAns){
		//获取选项列表
		let list = this.quesList.children,
			// 题正误状态
			status = true,
			// 获取正确项
			rightItem,
			// 我的选项
			myItem
		// 通过正确答案找到正确项
		for (let item of list) {
			// 每一项对应的答案
			let ans = item.getAttribute("answer")
			if (rightAns == ans) {
				rightItem = item
			}
			if(myAns == ans){
				myItem = item
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
			myAns: myAns,
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
	},
	/**
	 * 检查答题信息，设置答题状态,返回题目是否已经做过
	 */
	checkState: function(quesNum){
		// 获取答题记录
		var quesInfo = this.answerSheet.state[quesNum]
		// 如果存在答题记录则根据记录设置答题状态
		if (quesInfo) {
			// 传入答案设置状态
			this.judge(quesInfo.myAns, quesInfo.rightAns)
			return true
		} else {
			return false
		}
	}
}