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
	var question = new Question(result),
		// 视图管理对象
		view = new QuestionView("container")

	//创建题目迭代器
	var iter = question.iterator()

	// 第一次渲染题目
	view.showQuestion(iter.first())

	/**
	 * 前后题目切换模块,需要解决数据耦合,所以在外部实现
	 * @param  {[type]} view [视图对象]
	 * @param  {[type]} iter [数据迭代器]
	 */
	var preHandler = function(view, iter){
		let data = iter.pre()
		if(data){
			view.showQuestion(data)
		}
	},
	nextHandler = function(view, iter){
		let data = iter.next()
		if(data){
			view.showQuestion(data)
		}
	}
	// 函数柯里化传入额外数据重写函数
	preHandler = preHandler.bind(view.preBtn, view, iter)
	nextHandler = nextHandler.bind(view.nextBtn, view, iter)
	// 绑定事件
	view.preBtn.addEventListener("click", preHandler, false)
	view.nextBtn.addEventListener("click", nextHandler, false)


	// 创建题目状态管理模块,参数为id
	question.createManager("stateManager")
	// 点击切换题目
	stateHandler = stateHandler.bind(question, view, iter)
	question.stateManager.addEventListener("click", stateHandler, false)
	function stateHandler(view, iter, event){
		var target = event.target,
			// 序号
			num = parseInt(target.innerHTML)
		// 加载对应题号的题目
		view.showQuestion(iter.get(num-1))

		// 设置背景颜色
		Observer.fire("changeStateColor",{
			color: "active",
			// 当前元素和上一个元素
			target: target,
			preEle: this.preEle
		})
		// 将点击过的元素缓存起来以便后面使用
		this.preEle = target
	}


	Observer.setWatcher("question",question)
	Observer.setWatcher("view",view)
}
//加载题目并执行回调函数
loadQuestion("file", main)
