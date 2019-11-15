var MVC = {}
// 初始化数据模型层
MVC.model = function(){
	// 数据对象
	var Question = {
		// 保存题目数据,对象数组
		data: [],
		// 保存题目状态,即答题卡数据
		state: {},
		// 保存当前题目数据
		current: null,
		
	},
	// 当前索引值，默认为0
	index = 0
	// 返回数据层接口
	return {
		// 匹配数据
		matchData: function(result){
			//去除表头
			if (isNaN(result[0])){
				result.shift()
			}
			var _this = this
			result.forEach(function(item, index){
				// 构造适合视图的数据
				let data = {
					id: parseInt(item[0]),
					title: item[1].trim(),
					list: [item[2], item[3], item[4], item[5]],
					answer: item[6].trim()
				}
				// 设置数据
				_this.pushData(data)
			})
		},
		/**
		 * 添加题目数据
		 * @param {Object} value   题目对象
		 */
		pushData: function(value){
			Question.data.push(value)
			return this
		},
		/**
		 * 题目迭代器
		 */
		iterator: (function(){
			let items = Question.data
			return {
				first: function(){
					index = 0  // 矫正当前索引和当前题目
					Question.current = items[index]
					return items[index]
				},
				last: function(){
					index = items.length - 1
					Question.current = items[index]
					return items[index]
				},
				pre: function(){
					if(--index >= 0){  //  如果索引值大于等于零获取相应元素
						Question.current = items[index]
						return items[index]
					} else {
						index = 0
						return null
					}
				},
				next: function(){
					if(++index < items.length){  // 如果索引在范围内就获取元素
						Question.current = items[index]
						return items[index]
					} else {
						//矫正index
						index = items.length - 1
						return null
					}
				},
				get: function(num){
					if (num >= 0 && num <items.length) {
						Question.current = items[index]
						index = num  // 矫正index
						return items[index]
					} else return null
				},
				getLength: function(){
					return items.length
				}
			}
		})(),
		/**
		 * 添加题目状态数据
		 * @param {Object} key     题目序号
		 * @param {Object} value   题目状态对象
		 */
		setState: function(key, value){
			Question.state[key] = value
			return this
		},
		/**
		 * 获取题目状态数据
		 * @param {Object} key  题目序号
		 */
		getState: function(key){
			return Question.state[key]
		},
		getCurrent: function(){
			return Question.current
		}
	}
}()
// 初始化视图层
MVC.view = function(){
	// 保存dom组件
	var view = {
		container: null,
		question: {
			id: null,
			title: null,
			list: [],
			preBtn: null,
			nextBtn: null
		},
		answerSheet: {
			element: null,
			preEle: null
		}
	}
	return {
		/**
		 * 初始化视图
		 */
		init: function(id){
			let html = `
				<div class="panel panel-default questionBox">
					<div class="panel-heading header">
						<div><span id="id"></span><span id="title"></span></div>
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
						<button id="preBtn" class="btn btn-default">上一题</button>
						<button id="nextBtn" class="btn btn-default">下一题</button>
					</div>
				</div>
			`
			// 初始化试图
			var div = document.createElement('div')
			div.innerHTML = html
			div.id = "question"
			let container = document.getElementById(id)
			container.appendChild(div)
			// 缓存视图组件
			view.container = container
			view.question.id = document.getElementById("id") //题目
			view.question.title = document.getElementById("title") //题目
			view.question.list = document.getElementById("list")  //选项列表
			view.question.preBtn = document.getElementById("preBtn")  //上一题按钮
			view.question.nextBtn = document.getElementById("nextBtn")//下一题按钮
		},
		/**
		 * 渲染题目数据
		 * @param {Object} data
		 */
		showQuestion: function(data){
			let question = view.question
			question.id.innerText = data.id
			question.title.innerText = data.title
			Array.prototype.forEach.call(question.list.children, function(item, index){
				item.innerText = data.list[index]
			})
		},
		/**
		 * 验证答案并设置题目状态
		 * @param  {[type]} myAns       [我的答案]
		 * @param  {[type]} rightAns    [正确答案]
		 */
		judge: function(myAns, rightAns){
			//获取选项列表
			let list = view.question.list.children,
				// 题正误状态
				status = true,
				// 获取正确项
				rightItem,
				// 我的选项
				myItem
			// 通过正确答案找到正确dom项
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
			// 返回题目状态信息
			return {
				// 对错
				status: status,
				// 我的答案和正确答案
				myAns: myAns,
				rightAns: rightAns
			}
		},
		/**
		 * 创建答题卡
		 * id        答题卡id
		 * length    题目数量
		 */
		createAnswerSheet: function(id, length){
			var div = document.createElement('div'),
				// 视图缓存
				html = ''
			// 没有表头，第一行就是数据
			for (let i=1; i<=length; i++) {
				html += `<div>${i}</div>`
			}
			div.innerHTML = html
			div.id = "answerSheet"
			view.answerSheet.element = div
			document.getElementById(id).appendChild(div)
			// 答题卡操作接口
			return {
				/**
				 * 设置为答题正确
				 * @param {Object} id  答题卡序号
				 */ 
				success: function(id){
					let items = view.answerSheet.element.children
					items[id].className = "success"
				},
				fail: function(id){
					let items = view.answerSheet.element.children
					items[id].className = "failed"
				},
				// 设置答题卡光标
				current: function(id){
					let items = view.answerSheet.element.children
					// 如果存在上一个元素则移除其active类
					if(view.answerSheet.preEle){
						view.answerSheet.preEle.classList.remove("active")
					}
					items[id].classList.add("active")
					// 更新上一个元素
					view.answerSheet.preEle = items[id]
				}
			}
		},
		// 切换题目时,重置选项颜色
		resetColor: function(){
			let list = view.question.list.children
			for (let item of list) {
				item.className = ""
			}
		},
		// 获取题目视图组件,绑定事件在外部进行
		getQuestionView: function(){
			return view.question
		},
		// 获取答题卡视图组件,外部绑定事件
		getAnswerSheetView: function(){
			return view.answerSheet.element
		},
		// 获取答题卡视图组件,外部绑定事件
		getContainer: function(){
			return view.container
		}
	}
}()
// 初始化管理器层
MVC.ctrl = function(){
	var M = MVC.model,
	V = MVC.view,
	C = {
		//初始化控制器
		bindEvent: function(M, V){
			
			// 创建答题卡模块
			let id = V.getContainer().id,
				length = M.iterator.getLength(),
				// 创建答题卡
				sheet = V.createAnswerSheet(id, length),
				// 获取dom元素,注意要先创建答题卡才能获取
				answerSheet = V.getAnswerSheetView()
				// 绑定题目模块的事件
			let	question = V.getQuestionView(),
			clickHandler =  function(event){
				let target = event.target
					// 由于利用委托,要防止点到父元素
					if (target.nodeName != "LI") {
						return
					}
					let currentQuestion =  M.getCurrent(),
						myAns = target.getAttribute("answer"),
						rightAns = currentQuestion["answer"]
					// flag为返回的判断结果对象
					let judgeResult = V.judge(myAns, rightAns)
					// 添加做题记录
					M.setState(currentQuestion.id, judgeResult)
					// 如果答题正确正确,自动下一题,并更新state状态
					if(judgeResult.status){
						// 改变答题卡信息
						sheet.success(currentQuestion.id - 1)
						//下一题
						setTimeout(function(){
							question.nextBtn.click()
						}, 200)
					} else {
						sheet.fail(currentQuestion.id - 1)
					}
					// 触发之后移除事件防止多次触发
					question.list.onclick = null
			}
			// 首次绑定答题点击事件value
			// 事件委托, 使用dom0级绑定事件方便解除
			question.list.onclick = clickHandler
			
			/**
			 * 答题卡模块逻辑
			 */
			// 如果存在答题记录则设置选项颜色
			// 传入的是题目id,不需要减一
			var checkState = function(id){
				var curState = M.getState(id)
				console.log(id,curState)
				V.resetColor()
				if (curState) {
					V.judge(curState.myAns, curState.rightAns)
				} else {
					// 如果不存在当前题目的答题记录,则重新绑定答题事件
					question.list.onclick = clickHandler
				}
			}
			// 默认第一道题为当前状态
			sheet.current(0)
			// 事件委托
			answerSheet.addEventListener("click", function(event){
				let target = event.target,
					// 获取序号,序号要减一
					quesNum = target.innerText
				
				checkState(quesNum)
				V.showQuestion(M.iterator.get(quesNum - 1))
				sheet.current(quesNum - 1)
				
			})
			
			/**
			 * 前后按钮事件绑定
			 */
			var btnHandler = function(M, V, data){
				if (!data){
					return
				}
				V.showQuestion(data)
				checkState(data.id)
				sheet.current(data.id - 1)
			}
			question.nextBtn.addEventListener("click", function(){
				btnHandler.call(null, M, V, M.iterator.next())
			}, true)
			question.preBtn.addEventListener("click", function(){
				btnHandler.call(null, M, V, M.iterator.pre())
			}, true)
		}
	}
	return {
		// 遍历执行方法
		init: function(){
			// 遍历内部管理器
			for (let item in C) {
				C[item] && C[item](M, V)
			}
		}
	}
}()

